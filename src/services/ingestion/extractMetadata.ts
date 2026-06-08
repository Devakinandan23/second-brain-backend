import * as cheerio from 'cheerio';
import axios from 'axios';
type SourceType = "YOUTUBE" | "TWITTER" | "NOTION" | "GOOGLE_DOC" | "WEBSITE" | "INTERNAL";


function classifySource(link: string) {
    const myUrl = new URL(link);

    console.log("URL^&^&^&",myUrl);
    let source:SourceType = "WEBSITE";

    if (myUrl.hostname == "www.youtube.com"){
        source = "YOUTUBE"
    }
    else if (myUrl.hostname == "youtu.be"){
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
    else{
        source = "WEBSITE"
    }
    return source;
}

export async function extractMetadata(link: string) {
    try{
    const response = await axios.get(link,{
        headers: {
            "User-Agent": "MyAwesomeApp/1.0 (Contact: darik32@gmail.com)"
        }, 
        timeout: 5000 
    });
    console.log("+++++====",response.data.slice(0, 2000));

    const sourceType = classifySource(link);
    
    const $ = cheerio.load(response.data);
    
    const title = $('meta[property="og:title"]').attr('content') || $('meta[property="title"]').attr('content') || $('title').text() || null;
    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || null;
    const thumbnail = $('meta[property="og:image"]').attr('content') || $('meta[name="image"]').attr('content') || null;

    const site_name = $('meta[property="og:site_name"]').attr('content') || $('meta[name="site_name"]').attr('content') || null;
    const type = $('meta[property="og:type"]').attr('content') || $('meta[name="type"]').attr('content') || null;
    const url = $('meta[property="og:url"]').attr('content') || $('meta[name="url"]').attr('content') || null;

    const metadata = {
        site_name,
        type,
        url
    }

    return{
        sourceType,
        title,
        description,
        thumbnail,
        metadata
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