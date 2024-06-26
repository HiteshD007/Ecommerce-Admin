import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

export const POST = async (
    req: Request,
    {params}: {params: {storeId: string}}
) => {
    try {
        const {userId} = auth();
        const body = await req.json();
        const {
          name,
          price,
          categoryId,
          sizeId,
          colorId,
          images,
          isFeatured,
          isArchived
        } = body;

        if(!userId){
            return new NextResponse("Unauthenticated",{status: 401});
        }

        if(!name){
            return new NextResponse("Name is required",{status: 400});
        }

        if(!images || !images.length){
            return new NextResponse("Images are required",{status: 400});
        }

        if(!price){
            return new NextResponse("Price is required",{status: 400});
        }

        if(!categoryId){
            return new NextResponse("Category is required",{status: 400});
        }

        if(!sizeId){
            return new NextResponse("Size is required",{status: 400});
        }

        if(!colorId){
            return new NextResponse("Color is required",{status: 400});
        }

        if(!params.storeId){
            return new NextResponse("Store id is required", {status: 400});
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        });


        if(!storeByUserId) {
            return new NextResponse("Unauthorised", {status: 403});
        }

        const product = await prismadb.product.create({
            data:{
                name,
                price,
                isArchived,
                isFeatured,
                categoryId,
                colorId,
                sizeId,
                storeId: params.storeId,
                images: {
                  createMany:{
                    data: [
                      ...images.map((image: {url: string}) => image)
                    ]
                  }
                }
            }
        });

        return NextResponse.json(product);
        
    } catch (error) {
        console.log('[PRODUCTS_POST]',error);
        return new NextResponse("Internal Server Error", {status: 500});
    }
};



export const GET = async (
    req: Request,
    {params}: {params: {storeId: string}}
) => {
    try {
        const { searchParams } = new URL(req.url);
        const categoryId  = searchParams.get("categoryId") || undefined; 
        const sizeId  = searchParams.get("sizeId") || undefined; 
        const colorId  = searchParams.get("colorId") || undefined; 
        const isFeatured  = searchParams.get("isFeatured"); 
        const isArchived  = searchParams.get("isArchived"); 

        if(!params.storeId){
          return new NextResponse("Store id is required", {status: 400});
        }

        const products = await prismadb.product.findMany({
            where:{
              storeId: params.storeId,
              categoryId,
              colorId,
              sizeId,
              isFeatured: isFeatured ? true : undefined,
              isArchived: false
            },
            include: {
              images: true,
              category: true,
              size: true,
              color: true,
            },
            orderBy: {
              createdAt: 'desc'
            }
        });

        return NextResponse.json(products);
        
    } catch (error) {
        console.log('[PRODUCTS_GET]',error);
        return new NextResponse("Internal Server Error", {status: 500});
    }
}