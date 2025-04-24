// Raj and related
interface MaterialRaj {
    id: number;
    materialId: number;
}

interface RajDetail {
    raj: number;
    costCoef: number;
    mainRaj: number | null;
    showCopies: boolean;
    materialRajs: MaterialRaj[];
}

interface Rajs {
    [key: string]: RajDetail;
}

// Tie lengths
interface TieLength {
    id: number;
    tieTypeId: number;
    length: number;
    description: string;
    title: string;
}

interface TieLengths {
    [key: string]: TieLength;
}

// Layouts and tie types
type Layouts = Record<string, string>;
type TieTypes = Record<string, string>;

// Send methods
interface SendMethod {
    id: number;
    title: string;
    description: string;
}

interface SendMethods {
    [key: string]: SendMethod;
}

// Settings
interface Settings {
    AgentsProphit: string;
    AudioPlanCost: string;
    BulkProductionDays: string;
    BulkReturnPercents: string;
    BulkSale: string;
    CitiesFormalAgent: string;
    CitiesWithAgent: string;
    CitiesWithoutAgent: string;
    CloseStore: string;
    Coloring: string;
    CompanyProphit: string;
    DaremcoPlusLinks: string;
    DelayProduction: string;
    DesignCost: string;
    Deviding: string;
    DiscountHeaderText: string;
    GiftMessage: string;
    MinAgentShoppingPerDay: string;
    MinProductionMoghat: string;
    OverflowPercent: string;
    OwnerMessage: string;
    PackagingColorDelay: string;
    PackagingProductDelay: string;
    PlanProphit: string;
    PlanReturnPercents: string;
    PlotCost: string;
    PositiveProductionSale: string;
    PositiveSale: string;
    PrintPageCost: string;
    ProductionCapacity: string;
    ProductionDate: string;
    ProductionMessage: string;
    ProductionMessageStock: string;
    SizeCoefMoghatMax: string;
    SizeCoefMoghatMin: string;
    SizeCoefPercentMax: string;
    SizeCoefPercentMin: string;
    SkeinReturnPercents: string;
    SkeinReturnPercentStock: string;
    TaxPercent: string;
}

// Messages
interface Messages {
    Lottory: string;
    FreePlans: string;
}

// Plan types
type PlanTypes = Record<string, string>;

// Materials
interface Material {
    id: number;
    name: string;
    price: number;
    weight: number;
    priceWeightCoef: number;
    showWeightCoef: number;
    coloringCoef: number;
    description: string;
    sign: string;
    materials: number;
    bulkSales: boolean;
    bulkMinWeight: number;
    bulkMinPrice: number;
    bulkMaxWeight: number;
    bulkMaxPrice: number;
    inStock: boolean;
    turns: string;
}

interface Materials {
    [key: string]: Material;
}

// Attributes
interface Attribute {
    id: number;
    name: string;
    description: string;
    icon: string;
    link: string;
}

// Sizes
interface Size {
    id: number;
    title: string;
    limits: string;
}

// Plan options
interface PlanOption {
    id: number;
    planTypeId: number;
    name: string;
    priceFactor: number;
    description: string;
}

// Shopping messages
interface ShoppingMessage {
    id: number;
    message: string;
    basket: boolean;
    clientBill: boolean;
    bill: boolean;
    siteTop: boolean;
    color: string;
    icon: string;
    closable: boolean;
    dueDate: string;
}

interface DeliveryMessages {
    [key: string]: string;
}

// Main container interface
export interface PrimaryData {
    rajs: Rajs;
    tieLengths: TieLengths;
    layouts: Layouts;
    tieTypes: TieTypes;
    sendMethods: SendMethods;
    settings: Settings;
    messages: Messages;
    planTypes: PlanTypes;
    materials: Materials;
    attributes: Attribute[];
    sizes: Size[];
    planOptions: PlanOption[];
    shoppingMessages: ShoppingMessage[];
    deliveryMessages: DeliveryMessages;
}
