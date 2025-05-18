export const Endpoints = {
    categories: 'categories',
    products: 'products',
    primaryData: 'primary-data',
    productColors: (id: number): string => `product/${id}/colors`
};
