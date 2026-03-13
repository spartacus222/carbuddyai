import { z } from "zod/v4";
export declare const shortlist: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "shortlist";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "shortlist";
            dataType: "number";
            columnType: "PgSerial";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        vehicleId: import("drizzle-orm/pg-core").PgColumn<{
            name: "vehicle_id";
            tableName: "shortlist";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "shortlist";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const insertShortlistSchema: z.ZodObject<{
    vehicleId: z.ZodInt;
}, {
    out: {};
    in: {};
}>;
export type Shortlist = typeof shortlist.$inferSelect;
export type InsertShortlist = z.infer<typeof insertShortlistSchema>;
//# sourceMappingURL=shortlist.d.ts.map