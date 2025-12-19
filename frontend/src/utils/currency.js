export const formatPriceVND = (priceUSD) => {
    if (priceUSD === null || priceUSD === undefined) return '0 đ';
    return new Intl.NumberFormat('vi-VN').format(priceUSD) + ' đ';
};
