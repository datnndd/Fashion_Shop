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
from sqlalchemy import func, select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.deps import get_admin_user
from app.models.orders import Order, OrderItem
from app.models.catalog import Product, ProductVariant
from app.models.user import User
from app.schemas.dashboard import DashboardStats, StatItem, ProductStat

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

async def get_stats_data(
    session: AsyncSession, 
    period: str = "day",
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    # Determine the grouping and interval
    # For charts: year -> group by month, month -> group by day, day -> group by hour
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
    
    # 1. Time stats (Revenue and Order Count)
    # Using text for the interval directly to avoid parameterization issues in GROUP BY
    trunc_expr = func.date_trunc(date_trunc_field, Order.created_at)
    
    time_query = (
        select(
            trunc_expr.label("label"),
            func.count(Order.order_id).label("order_count"),
            func.sum(Order.total_price).label("revenue")
        )
        .where(Order.created_at >= start_date)
        .where(Order.created_at <= end_date)
        .where(Order.status == "delivered")
        .group_by(trunc_expr)
        .order_by(trunc_expr)
    )
    
    time_results = await session.execute(time_query)

    # Create a map of existing results
    data_map = {
        row.label.strftime("%H:00" if period == "day" else "%d" if period == "month" else "%Y-%m"): row
        for row in time_results
    }
    
    time_stats = []
    
    if period == "day":
        # 24 hours
        current = start_date.replace(minute=0, second=0, microsecond=0)
        while current <= end_date:
            label = current.strftime("%H:00")
            if label in data_map:
                row = data_map[label]
                time_stats.append(StatItem(label=label, order_count=row.order_count, revenue=float(row.revenue or 0)))
            else:
                time_stats.append(StatItem(label=label, order_count=0, revenue=0.0))
            current += timedelta(hours=1)
            
    elif period == "month":
        # Days in month
        current = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        while current <= end_date:
            label = current.strftime("%d")
            if label in data_map:
                row = data_map[label]
                time_stats.append(StatItem(label=label, order_count=row.order_count, revenue=float(row.revenue or 0)))
            else:
                time_stats.append(StatItem(label=label, order_count=0, revenue=0.0))
            current += timedelta(days=1)
            
    elif period == "year":
        # 12 months
        current = start_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        while current <= end_date:
            label = current.strftime("%Y-%m")
            if label in data_map:
                row = data_map[label]
                time_stats.append(StatItem(label=label, order_count=row.order_count, revenue=float(row.revenue or 0)))
            else:
                time_stats.append(StatItem(label=label, order_count=0, revenue=0.0))
            # Move to next month
            if current.month == 12:
                current = current.replace(year=current.year + 1, month=1)
            else:
                current = current.replace(month=current.month + 1)
    
    else:
        # Default behavior for other periods - just map existing results
        time_stats = [
            StatItem(
                label=row.label.strftime("%Y-%m-%d"),
                order_count=row.order_count,
                revenue=float(row.revenue or 0)
            )
            for row in time_results
        ]

    # 2. Total Stats for current and previous period (for change percent)
    date_range_days = (end_date - start_date).days or 1
    
    current_total_query = (
        select(
            func.count(Order.order_id).label("total_orders"),
            func.sum(Order.total_price).label("total_revenue")
        ).where(Order.created_at >= start_date, Order.created_at <= end_date)
        .where(Order.status == "delivered")
    )
    current_total = (await session.execute(current_total_query)).one()
    
    prev_start_date = start_date - timedelta(days=date_range_days)
    prev_end_date = start_date - timedelta(seconds=1)
    prev_total_query = (
        select(
            func.count(Order.order_id).label("total_orders"),
            func.sum(Order.total_price).label("total_revenue")
        ).where(Order.created_at >= prev_start_date, Order.created_at <= prev_end_date)
        .where(Order.status == "delivered")
    )
    prev_total = (await session.execute(prev_total_query)).one()

    def calc_change(curr, prev):
        if not prev or prev == 0:
            return 100.0 if curr > 0 else 0.0
        return float((curr - prev) / prev * 100)

    order_change = calc_change(current_total.total_orders, prev_total.total_orders)
    revenue_change = calc_change(float(current_total.total_revenue or 0), float(prev_total.total_revenue or 0))

    # 3. Top Best Sellers (within date range)
    best_sellers_query = (
        select(
            Product.product_id,
            Product.name,
            func.coalesce(func.sum(OrderItem.quantity), 0).label("total_sold"),
            func.coalesce(func.sum(OrderItem.total_price), 0).label("revenue")
        )
        .join(ProductVariant, Product.product_id == ProductVariant.product_id)
        .join(OrderItem, ProductVariant.variant_id == OrderItem.product_variant_id)
        .join(Order, OrderItem.order_id == Order.order_id)
        .where(Order.created_at >= start_date)
        .where(Order.created_at <= end_date)
        .where(Order.status == "delivered")
        .group_by(Product.product_id, Product.name)
        .order_by(desc("total_sold"))
        .limit(5)
    )

    best_sellers_results = await session.execute(best_sellers_query)
    top_best_sellers = [
        ProductStat(
            product_id=row.product_id,
            name=row.name,
            total_sold=row.total_sold,
            revenue=float(row.revenue or 0)
        ) for row in best_sellers_results
    ]

    # 4. Top Worst Sellers (including those with 0 sales)
    # Strategy: All products join with order items, group and sort ascending.
    worst_sellers_query = (
        select(
            Product.product_id,
            Product.name,
            func.coalesce(func.sum(OrderItem.quantity), 0).label("total_sold"),
            func.coalesce(func.sum(OrderItem.total_price), 0).label("revenue")
        )
        .join(ProductVariant, Product.product_id == ProductVariant.product_id, isouter=True)
        .join(OrderItem, ProductVariant.variant_id == OrderItem.product_variant_id, isouter=True)
        .group_by(Product.product_id, Product.name)
        .order_by("total_sold", "revenue")
        .limit(5)
    )
    worst_sellers_results = await session.execute(worst_sellers_query)
    top_worst_sellers = [
        ProductStat(
            product_id=row.product_id,
            name=row.name,
            total_sold=row.total_sold,
            revenue=float(row.revenue or 0)
        ) for row in worst_sellers_results
    ]

    return DashboardStats(
        total_orders=current_total.total_orders,
        total_revenue=float(current_total.total_revenue or 0),
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
    admin: User = Depends(get_admin_user)
):
    parsed_start = None
    parsed_end = None
    
    if start_date:
        try:
            if period == "day":
                # YYYY-MM-DD format - show data for that specific day
                parsed_start = datetime.strptime(start_date, "%Y-%m-%d")
                parsed_end = parsed_start  # Same day
            elif period == "month":
                # YYYY-MM format - show data for that month
                parsed_start = datetime.strptime(start_date + "-01", "%Y-%m-%d")
                # Calculate last day of month
                if parsed_start.month == 12:
                    parsed_end = datetime(parsed_start.year + 1, 1, 1) - timedelta(days=1)
                else:
                    parsed_end = datetime(parsed_start.year, parsed_start.month + 1, 1) - timedelta(days=1)
            elif period == "year":
                # YYYY format - show data for that year
                try:
                    year = int(start_date)
                except ValueError:
                    # Try parsing as date first if it comes as YYYY-MM-DD
                    try:
                        dt = datetime.strptime(start_date, "%Y-%m-%d")
                        year = dt.year
                    except ValueError:
                        # Fallback to current year if all else fails
                        year = datetime.now().year
                
                parsed_start = datetime(year, 1, 1)
                parsed_end = datetime(year, 12, 31)
        except ValueError:
            pass  # Use default if parsing fails
    
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
    admin: User = Depends(get_admin_user)
):
    parsed_start, parsed_end = parse_date_by_period(period, start_date, end_date)
    stats = await get_stats_data(session, period, parsed_start, parsed_end)
    
    # Create Excel file
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        # Time stats
        df_time = pd.DataFrame([s.model_dump() for s in stats.time_stats])
        df_time.to_excel(writer, sheet_name='Sales Over Time', index=False)
        
        # Best Sellers
        df_best = pd.DataFrame([s.model_dump() for s in stats.top_best_sellers])
        df_best.to_excel(writer, sheet_name='Top Best Sellers', index=False)
        
        # Worst Sellers
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
    admin: User = Depends(get_admin_user)
):
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

