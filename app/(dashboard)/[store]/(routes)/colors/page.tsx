import { Metadata } from "next";
import { format } from "date-fns";

import prismadb from "@/lib/prismadb";
import { ColorClient } from "./components/color-client";
import { ColorColumn } from "./components/columns";


export const metadata: Metadata = {
    title: "Admin | Colors",
    description: "Admin Colors Page"
};


const Sizes = async ({
    params
}:{
    params:  {store: string}
}) => {

    const colors = await prismadb.color.findMany({
        where:{
         storeId: params.store   
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const formattedColors: ColorColumn[] = colors.map((item) => ({
        id: item.id,
        name: item.name,
        value: item.value,
        createdAt: format(item.createdAt, "MMMM do, yyyy")
    }))

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <ColorClient data={formattedColors} />
            </div>
        </div>
    )
};


export default Sizes;