export type QuerySort = {
    column: string;
    direction: "ASC" | "DESC";
};

export type QueryFilter = {
    column: string;
    value: string;
};
