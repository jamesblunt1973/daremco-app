export interface BulkTypeGroup {
    DimsHeight: number;
    DimsWidth: number;
    Raj: number;
    MaterialId: number;
    Materials: number;
    TieTypeId: number;
    MainTieLengthId: number;
    list: {
        Price: number;
        Count: number;
    }[];
}
