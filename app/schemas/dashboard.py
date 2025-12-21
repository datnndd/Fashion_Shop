from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class StatItem(BaseModel):
    label: str
    order_count: int
    revenue: float

class ProductStat(BaseModel):
    product_id: int
    name: str
    total_sold: int
    revenue: float

class DashboardStats(BaseModel):
    total_orders: int
    total_revenue: float
    order_change_percent: float
    revenue_change_percent: float
    time_stats: List[StatItem]
    top_best_sellers: List[ProductStat]
    top_worst_sellers: List[ProductStat]
