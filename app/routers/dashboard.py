import io
from datetime import datetime, timedelta
from typing import List, Optional

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from fastapi.responses import StreamingResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.deps import get_admin_user
from app.schemas.dashboard import DashboardStats, StatItem, ProductStat

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


async def get_stats_data(
    session: AsyncSession, 
    period: str = "day",
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """
    Get dashboard statistics data using raw SQL.
    
    SQL queries used:
    - Time stats with date_trunc for grouping by hour/day/month
    - Best sellers with JOIN on products, variants, order_items
    - Worst sellers (products with lowest sales)
    """
    # Determine the grouping and interval
    if period == "day":
        date_trunc_field = "hour"
        default_days_back = 1
    elif period == "month":
        date_trunc_field = "day"
        default_days_back = 31
    elif period == "year":
        date_trunc_field = "month"
        default_days_back = 365
    else:
        date_trunc_field = "day"
        default_days_back = 30

    # Use custom date range if provided, otherwise use default
    if start_date is None:
        start_date = datetime.now() - timedelta(days=default_days_back)
    if end_date is None:
        end_date = datetime.now()
    
    # Ensure end_date includes the entire day
    end_date = end_date.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    # 1. Time stats (Revenue and Order Count) - Raw SQL with date_trunc
    time_query = text(f"""
        SELECT 
            date_trunc(:date_trunc_field, created_at) as label,
            COUNT(order_id) as order_count,
            COALESCE(SUM(total_price), 0) as revenue
        FROM orders
        WHERE created_at >= :start_date 
          AND created_at <= :end_date
          AND status = 'delivered'
        GROUP BY date_trunc(:date_trunc_field, created_at)
        ORDER BY label
    """)
    
    time_results = await session.execute(time_query, {
        "date_trunc_field": date_trunc_field,
        "start_date": start_date,
        "end_date": end_date
    })

    # Create a map of existing results
    data_map = {}
    for row in time_results.mappings().all():
        if period == "day":
            key = row["label"].strftime("%H:00")
        elif period == "month":
            key = row["label"].strftime("%d")
        else:
            key = row["label"].strftime("%Y-%m")
        data_map[key] = row
    
    time_stats = []
    
    if period == "day":
        current = start_date.replace(minute=0, second=0, microsecond=0)
        while current <= end_date:
            label = current.strftime("%H:00")
            if label in data_map:
                row = data_map[label]
                time_stats.append(StatItem(label=label, order_count=row["order_count"], revenue=float(row["revenue"] or 0)))
            else:
                time_stats.append(StatItem(label=label, order_count=0, revenue=0.0))
            current += timedelta(hours=1)
            
    elif period == "month":
        current = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        while current <= end_date:
            label = current.strftime("%d")
            if label in data_map:
                row = data_map[label]
                time_stats.append(StatItem(label=label, order_count=row["order_count"], revenue=float(row["revenue"] or 0)))
            else:
                time_stats.append(StatItem(label=label, order_count=0, revenue=0.0))
            current += timedelta(days=1)
            
    elif period == "year":
        current = start_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        while current <= end_date:
            label = current.strftime("%Y-%m")
            if label in data_map:
                row = data_map[label]
                time_stats.append(StatItem(label=label, order_count=row["order_count"], revenue=float(row["revenue"] or 0)))
            else:
                time_stats.append(StatItem(label=label, order_count=0, revenue=0.0))
            if current.month == 12:
                current = current.replace(year=current.year + 1, month=1)
            else:
                current = current.replace(month=current.month + 1)
    else:
        time_stats = [
            StatItem(label=row["label"].strftime("%Y-%m-%d"), order_count=row["order_count"], revenue=float(row["revenue"] or 0))
            for row in data_map.values()
        ]

    # 2. Total Stats for current and previous period (for change percent)
    date_range_days = (end_date - start_date).days or 1
    
    # Current period totals
    current_total_result = await session.execute(
        text("""
            SELECT COUNT(order_id) as total_orders, COALESCE(SUM(total_price), 0) as total_revenue
            FROM orders
            WHERE created_at >= :start_date AND created_at <= :end_date AND status = 'delivered'
        """),
        {"start_date": start_date, "end_date": end_date}
    )
    current_total = current_total_result.mappings().one()
    
    # Previous period totals
    prev_start_date = start_date - timedelta(days=date_range_days)
    prev_end_date = start_date - timedelta(seconds=1)
    prev_total_result = await session.execute(
        text("""
            SELECT COUNT(order_id) as total_orders, COALESCE(SUM(total_price), 0) as total_revenue
            FROM orders
            WHERE created_at >= :start_date AND created_at <= :end_date AND status = 'delivered'
        """),
        {"start_date": prev_start_date, "end_date": prev_end_date}
    )
    prev_total = prev_total_result.mappings().one()

    def calc_change(curr, prev):
        if not prev or prev == 0:
            return 100.0 if curr > 0 else 0.0
        return float((curr - prev) / prev * 100)

    order_change = calc_change(current_total["total_orders"], prev_total["total_orders"])
    revenue_change = calc_change(float(current_total["total_revenue"] or 0), float(prev_total["total_revenue"] or 0))

    # 3. Top Best Sellers - Raw SQL with JOINs
    best_sellers_result = await session.execute(
        text("""
            SELECT 
                p.product_id,
                p.name,
                COALESCE(SUM(oi.quantity), 0) as total_sold,
                COALESCE(SUM(oi.total_price), 0) as revenue
            FROM products p
            JOIN product_variants pv ON p.product_id = pv.product_id
            JOIN order_items oi ON pv.variant_id = oi.product_variant_id
            JOIN orders o ON oi.order_id = o.order_id
            WHERE o.created_at >= :start_date 
              AND o.created_at <= :end_date
              AND o.status = 'delivered'
            GROUP BY p.product_id, p.name
            ORDER BY total_sold DESC
            LIMIT 5
        """),
        {"start_date": start_date, "end_date": end_date}
    )
    top_best_sellers = [
        ProductStat(
            product_id=row["product_id"],
            name=row["name"],
            total_sold=row["total_sold"],
            revenue=float(row["revenue"] or 0)
        ) for row in best_sellers_result.mappings().all()
    ]

    # 4. Top Worst Sellers (products with lowest sales, including 0) - Raw SQL with LEFT JOINs
    worst_sellers_result = await session.execute(
        text("""
            SELECT 
                p.product_id,
                p.name,
                COALESCE(SUM(oi.quantity), 0) as total_sold,
                COALESCE(SUM(oi.total_price), 0) as revenue
            FROM products p
            LEFT JOIN product_variants pv ON p.product_id = pv.product_id
            LEFT JOIN order_items oi ON pv.variant_id = oi.product_variant_id
            GROUP BY p.product_id, p.name
            ORDER BY total_sold ASC, revenue ASC
            LIMIT 5
        """)
    )
    top_worst_sellers = [
        ProductStat(
            product_id=row["product_id"],
            name=row["name"],
            total_sold=row["total_sold"],
            revenue=float(row["revenue"] or 0)
        ) for row in worst_sellers_result.mappings().all()
    ]

    return DashboardStats(
        total_orders=current_total["total_orders"],
        total_revenue=float(current_total["total_revenue"] or 0),
        order_change_percent=order_change,
        revenue_change_percent=revenue_change,
        time_stats=time_stats,
        top_best_sellers=top_best_sellers,
        top_worst_sellers=top_worst_sellers
    )


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    period: str = Query("day", enum=["day", "month", "year"]),
    start_date: Optional[str] = Query(None, description="Date filter: YYYY-MM-DD for day, YYYY-MM for month, YYYY for year"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format (optional)"),
    session: AsyncSession = Depends(get_session),
    admin: dict = Depends(get_admin_user)
):
    """Get dashboard statistics."""
    parsed_start = None
    parsed_end = None
    
    if start_date:
        try:
            if period == "day":
                parsed_start = datetime.strptime(start_date, "%Y-%m-%d")
                parsed_end = parsed_start
            elif period == "month":
                parsed_start = datetime.strptime(start_date + "-01", "%Y-%m-%d")
                if parsed_start.month == 12:
                    parsed_end = datetime(parsed_start.year + 1, 1, 1) - timedelta(days=1)
                else:
                    parsed_end = datetime(parsed_start.year, parsed_start.month + 1, 1) - timedelta(days=1)
            elif period == "year":
                try:
                    year = int(start_date)
                except ValueError:
                    try:
                        dt = datetime.strptime(start_date, "%Y-%m-%d")
                        year = dt.year
                    except ValueError:
                        year = datetime.now().year
                
                parsed_start = datetime(year, 1, 1)
                parsed_end = datetime(year, 12, 31)
        except ValueError:
            pass
    
    if end_date and not parsed_end:
        try:
            parsed_end = datetime.strptime(end_date, "%Y-%m-%d")
        except ValueError:
            pass
            
    return await get_stats_data(session, period, parsed_start, parsed_end)


def parse_date_by_period(period: str, start_date: Optional[str], end_date: Optional[str] = None):
    """Parse date string based on period type."""
    parsed_start = None
    parsed_end = None
    
    if start_date:
        try:
            if period == "day":
                parsed_start = datetime.strptime(start_date, "%Y-%m-%d")
                parsed_end = parsed_start
            elif period == "month":
                parsed_start = datetime.strptime(start_date + "-01", "%Y-%m-%d")
                if parsed_start.month == 12:
                    parsed_end = datetime(parsed_start.year + 1, 1, 1) - timedelta(days=1)
                else:
                    parsed_end = datetime(parsed_start.year, parsed_start.month + 1, 1) - timedelta(days=1)
            elif period == "year":
                year = int(start_date)
                parsed_start = datetime(year, 1, 1)
                parsed_end = datetime(year, 12, 31)
        except ValueError:
            pass
    
    if end_date and not parsed_end:
        try:
            parsed_end = datetime.strptime(end_date, "%Y-%m-%d")
        except ValueError:
            pass
    
    return parsed_start, parsed_end


@router.get("/export/excel")
async def export_excel(
    period: str = Query("day", enum=["day", "month", "year"]),
    start_date: Optional[str] = Query(None, description="Date filter"),
    end_date: Optional[str] = Query(None, description="End date"),
    session: AsyncSession = Depends(get_session),
    admin: dict = Depends(get_admin_user)
):
    """Export dashboard stats to Excel."""
    parsed_start, parsed_end = parse_date_by_period(period, start_date, end_date)
    stats = await get_stats_data(session, period, parsed_start, parsed_end)
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df_time = pd.DataFrame([s.model_dump() for s in stats.time_stats])
        df_time.to_excel(writer, sheet_name='Sales Over Time', index=False)
        
        df_best = pd.DataFrame([s.model_dump() for s in stats.top_best_sellers])
        df_best.to_excel(writer, sheet_name='Top Best Sellers', index=False)
        
        df_worst = pd.DataFrame([s.model_dump() for s in stats.top_worst_sellers])
        df_worst.to_excel(writer, sheet_name='Top Worst Sellers', index=False)
        
    output.seek(0)
    
    date_suffix = f"{start_date or 'default'}_{end_date or 'default'}" if (start_date or end_date) else datetime.now().strftime("%Y%m%d")
    headers = {
        'Content-Disposition': f'attachment; filename="dashboard_stats_{period}_{date_suffix}.xlsx"'
    }
    return StreamingResponse(output, headers=headers, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')


@router.get("/export/pdf")
async def export_pdf(
    period: str = Query("day", enum=["day", "month", "year"]),
    start_date: Optional[str] = Query(None, description="Date filter"),
    end_date: Optional[str] = Query(None, description="End date"),
    session: AsyncSession = Depends(get_session),
    admin: dict = Depends(get_admin_user)
):
    """Export dashboard stats to PDF."""
    parsed_start, parsed_end = parse_date_by_period(period, start_date, end_date)
    stats = await get_stats_data(session, period, parsed_start, parsed_end)
    
    output = io.BytesIO()
    doc = SimpleDocTemplate(output, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()
    
    date_range_str = f"{start_date or 'N/A'} to {end_date or 'N/A'}" if (start_date or end_date) else "Default Range"
    elements.append(Paragraph(f"Dashboard Statistics Report ({period.capitalize()})", styles['Title']))
    elements.append(Paragraph(f"Date Range: {date_range_str}", styles['Normal']))
    elements.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
    elements.append(Spacer(1, 12))
    
    # Summary Table
    summary_data = [
        ["Metric", "Value", "Change %"],
        ["Total Orders", stats.total_orders, f"{stats.order_change_percent:+.2f}%"],
        ["Total Revenue", f"{stats.total_revenue:,.0f} VND", f"{stats.revenue_change_percent:+.2f}%"]
    ]
    t = Table(summary_data, colWidths=[150, 150, 100])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(Paragraph("Summary", styles['Heading2']))
    elements.append(t)
    elements.append(Spacer(1, 20))
    
    # Top Best Sellers
    best_data = [["Product ID", "Name", "Total Sold", "Revenue (VND)"]]
    for product in stats.top_best_sellers:
        best_data.append([product.product_id, product.name, product.total_sold, f"{product.revenue:,.0f}"])
    
    t_best = Table(best_data, colWidths=[80, 200, 80, 100])
    t_best.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.darkgreen),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(Paragraph("Top 5 Best Sellers", styles['Heading2']))
    elements.append(t_best)
    elements.append(Spacer(1, 20))

    # Top Worst Sellers
    worst_data = [["Product ID", "Name", "Total Sold", "Revenue (VND)"]]
    for product in stats.top_worst_sellers:
        worst_data.append([product.product_id, product.name, product.total_sold, f"{product.revenue:,.0f}"])
    
    t_worst = Table(worst_data, colWidths=[80, 200, 80, 100])
    t_worst.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.darkred),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(Paragraph("Top 5 Worst Sellers", styles['Heading2']))
    elements.append(t_worst)
    
    doc.build(elements)
    output.seek(0)
    
    date_suffix = f"{start_date or 'default'}_{end_date or 'default'}" if (start_date or end_date) else datetime.now().strftime("%Y%m%d")
    headers = {
        'Content-Disposition': f'attachment; filename="dashboard_stats_{period}_{date_suffix}.pdf"'
    }
    return StreamingResponse(output, headers=headers, media_type='application/pdf')
