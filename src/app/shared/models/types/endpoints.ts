export const Endpoints = {
    categories: 'categories',
    products: 'products',
    primaryData: 'primary-data',
    mostUsedlinks: 'links',
    productColors: (id: number): string => `product/${id}/colors`
};
