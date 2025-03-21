import { NextRequest, NextResponse } from "next/server";
import { getPostMetaDataByTags } from "@/app/lib/getPostMetaData";
import { PostMetadata } from "@/app/definitions/Types";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(req.url);
        const tagsParam: string | null = searchParams.get("tags");

        if (!tagsParam) {
            return NextResponse.json({ error: "Tags are required" }, { status: 400 });
        }

        const tagsArray = tagsParam.split(",").map(tag => tag.trim());
        const posts: PostMetadata[] = await getPostMetaDataByTags(tagsArray);
        return NextResponse.json(posts);
    } catch (error) {
        console.error("Error in API route:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}