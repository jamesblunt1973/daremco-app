export interface BulkTypeGroup {
    dimsHeight: number;
    dimsWidth: number;
    raj: number;
    materialId: number;
    materials: number;
    tieTypeId: number;
    mainTieLengthId: number;
    list: {
        price: number;
        count: number;
    }[];
}
