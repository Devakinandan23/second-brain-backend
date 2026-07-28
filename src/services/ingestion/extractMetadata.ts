import * as cheerio from 'cheerio';
import axios from 'axios';
type SourceType = "YOUTUBE" | "TWITTER" | "NOTION" | "GOOGLE_DOC" | "WEBSITE" | "INTERNAL";

const requestOptions = {
    headers: {
        "User-Agent": "SecondBrain/1.0"
    },
    timeout: 5000
};

function classifySource(link: string) {
    const myUrl = new URL(link);

    let source:SourceType = "WEBSITE";

    if (["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be"].includes(myUrl.hostname)){
        source = "YOUTUBE"
    }
    else if (myUrl.hostname == "x.com"){
        source = "TWITTER"
    }
    else if (myUrl.hostname == "www.x.com"){
        source = "TWITTER"
    }
    else if (myUrl.hostname == "www.twitter.com"){
        source = "TWITTER"
    }
    else if (myUrl.hostname == "www.notion.so"){
        source = "NOTION"
    }
    else if (myUrl.hostname == "www.docs.google.com"){
        source = "GOOGLE_DOC"
    }
    else if (myUrl.hostname == "second-brain.app" || link.includes("second-brain.app/note")){
        source = "INTERNAL"
    }
    else{
        source = "WEBSITE"
    }
    return source;
}

function getYouTubeVideoId(link: string) {
    const url = new URL(link);

    if (url.hostname === "youtu.be") {
        return url.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com"].includes(url.hostname)) {
        if (url.pathname === "/watch") return url.searchParams.get("v");

        const [type, videoId] = url.pathname.split("/").filter(Boolean);
        if (["shorts", "embed", "live"].includes(type ?? "")) {
            return videoId ?? null;
        }
    }

    return null;
}

async function extractPageMetadata(link: string) {
    const response = await axios.get(link, requestOptions);
    const $ = cheerio.load(response.data);

    const title = $('meta[property="og:title"]').attr('content') || $('meta[property="title"]').attr('content') || $('title').text() || null;
    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || null;
    const thumbnail = $('meta[property="og:image"]').attr('content') || $('meta[name="image"]').attr('content') || null;

    return {
        title,
        description,
        thumbnail,
        metadata: {
            site_name: $('meta[property="og:site_name"]').attr('content') || $('meta[name="site_name"]').attr('content') || null,
            type: $('meta[property="og:type"]').attr('content') || $('meta[name="type"]').attr('content') || null,
            url: $('meta[property="og:url"]').attr('content') || $('meta[name="url"]').attr('content') || null
        }
    };
}

async function extractYouTubeMetadata(link: string) {
    const [oEmbedResult, pageResult] = await Promise.allSettled([
        axios.get<{
            title?: string;
            thumbnail_url?: string;
            author_name?: string;
            provider_name?: string;
        }>("https://www.youtube.com/oembed", {
            ...requestOptions,
            params: { url: link, format: "json" }
        }),
        extractPageMetadata(link)
    ]);

    const oEmbed = oEmbedResult.status === "fulfilled" ? oEmbedResult.value.data : null;
    const page = pageResult.status === "fulfilled" ? pageResult.value : null;
    const videoId = getYouTubeVideoId(link);
    const fallbackThumbnail = videoId
        ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
        : null;

    if (!oEmbed && !page && !fallbackThumbnail) return null;

    return {
        sourceType: "YOUTUBE" as SourceType,
        title: oEmbed?.title ?? page?.title ?? null,
        description: page?.description ?? null,
        thumbnail: oEmbed?.thumbnail_url ?? page?.thumbnail ?? fallbackThumbnail,
        metadata: {
            site_name: page?.metadata.site_name ?? oEmbed?.provider_name ?? "YouTube",
            type: page?.metadata.type ?? "video.other",
            url: page?.metadata.url ?? link,
            author_name: oEmbed?.author_name ?? null
        }
    };
}

export async function extractMetadata(link: string) {
    try{
    const sourceType = classifySource(link);

    if (sourceType === "INTERNAL") {
        return {
            title: null,
            description: null,
            thumbnail: null,
            metadata: {} as { site_name: string | null; type: string | null; url: string | null; },
            sourceType: "INTERNAL" as SourceType
        };
    }

    if (sourceType === "YOUTUBE") {
        return await extractYouTubeMetadata(link);
    }

    const page = await extractPageMetadata(link);
    return {
        sourceType,
        ...page
    }

    } catch(error) {
        if (axios.isAxiosError(error)) {
            console.error('Extraction error (Network):', error.message);
        } else if (error instanceof Error) {
            console.error('Extraction error:', error.message);
        } else {
            console.error('Extraction error:', String(error));
        }
        return null;
    }
}
