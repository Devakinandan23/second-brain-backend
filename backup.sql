--
-- PostgreSQL database dump
--

\restrict sg4HbMbsnyp7Zj3T0CPR1Ywk6A0c7aZfekxmUPOzpwFpW0nUmsvNEtTZYAIqd8J

-- Dumped from database version 18.3 (Debian 18.3-1.pgdg13+1)
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: SourceType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SourceType" AS ENUM (
    'YOUTUBE',
    'TWITTER',
    'NOTION',
    'GOOGLE_DOC',
    'WEBSITE',
    'INTERNAL'
);


ALTER TYPE public."SourceType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Note; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Note" (
    id uuid NOT NULL,
    "sourceType" public."SourceType" NOT NULL,
    title text NOT NULL,
    link text,
    content text,
    description text,
    thumbnail text,
    "authorName" text,
    metadata jsonb,
    "userId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isPublic" boolean DEFAULT false NOT NULL,
    "extractedTitle" text,
    "isFavorite" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Note" OWNER TO postgres;

--
-- Name: ShareLink; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ShareLink" (
    id integer NOT NULL,
    hash text NOT NULL,
    "userId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."ShareLink" OWNER TO postgres;

--
-- Name: ShareLink_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ShareLink_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ShareLink_id_seq" OWNER TO postgres;

--
-- Name: ShareLink_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ShareLink_id_seq" OWNED BY public."ShareLink".id;


--
-- Name: Tag; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Tag" (
    id integer NOT NULL,
    title text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Tag" OWNER TO postgres;

--
-- Name: Tag_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Tag_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Tag_id_seq" OWNER TO postgres;

--
-- Name: Tag_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Tag_id_seq" OWNED BY public."Tag".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: _NoteToTag; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_NoteToTag" (
    "A" uuid NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public."_NoteToTag" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: ShareLink id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShareLink" ALTER COLUMN id SET DEFAULT nextval('public."ShareLink_id_seq"'::regclass);


--
-- Name: Tag id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tag" ALTER COLUMN id SET DEFAULT nextval('public."Tag_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: Note; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Note" (id, "sourceType", title, link, content, description, thumbnail, "authorName", metadata, "userId", "createdAt", "updatedAt", "isPublic", "extractedTitle", "isFavorite") FROM stdin;
a25ac56d-928f-4e57-8679-222bc074a0e8	YOUTUBE	System Design Interview Basics	https://www.youtube.com/watch?v=dQw4w9WgXcQ	Distributed systems fundamentals and scaling concepts.	A beginner friendly system design video.	https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg	Tech Channel	{"videoId": "dQw4w9WgXcQ", "channelName": "Tech Channel", "publishedAt": "2026-05-20T10:00:00Z", "durationSeconds": 1250}	1	2026-05-27 17:58:01.1	2026-05-27 17:58:01.1	f	\N	f
b1e890b5-84d0-4d84-bb78-5eeb7291fad8	YOUTUBE	System Design Interview Basics	https://www.youtube.com/watch?v=dQw4w9WgXcQ	Distributed systems fundamentals and scaling concepts.	A beginner friendly system design video.	https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg	Tech Channel	{"videoId": "dQw4w9WgXcQ", "channelName": "Tech Channel", "publishedAt": "2026-05-20T10:00:00Z", "durationSeconds": 1250}	4	2026-05-28 20:51:09.171	2026-05-28 20:51:09.171	f	\N	f
17311463-6c53-48e5-b103-b186bfeab155	YOUTUBE	System Design Interview Basics	https://www.youtube.com/watch?v=dQw4w9WgXcQ	Distributed systems fundamentals and scaling concepts.	A beginner friendly system design video.	https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg	Tech Channel	{"videoId": "dQw4w9WgXcQ", "channelName": "Tech Channel", "publishedAt": "2026-05-20T10:00:00Z", "durationSeconds": 1250}	4	2026-05-28 20:51:14.062	2026-05-28 20:51:14.062	f	\N	f
255ab079-20eb-471d-96d3-6abd1082603d	YOUTUBE	System Design Interview Basics	https://www.youtube.com/watch?v=dQw4w9WgXcQ	Distributed systems fundamentals and scaling concepts.	A beginner friendly system design video.	https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg	Tech Channel	{"videoId": "dQw4w9WgXcQ", "channelName": "Tech Channel", "publishedAt": "2026-05-20T10:00:00Z", "durationSeconds": 1250}	4	2026-05-28 20:51:15.128	2026-05-28 20:51:15.128	f	\N	f
e790de5b-a2e1-4391-bd9d-35f7176b28f2	YOUTUBE	System Design Interview Basics	https://www.youtube.com/watch?v=dQw4w9WgXcQ	Distributed systems fundamentals and scaling concepts.	A beginner friendly system design video.	https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg	Tech Channel	{"videoId": "dQw4w9WgXcQ", "channelName": "Tech Channel", "publishedAt": "2026-05-20T10:00:00Z", "durationSeconds": 1250}	4	2026-05-28 20:51:16.083	2026-05-28 20:51:16.083	f	\N	f
84e0483f-3579-4ae6-ab8c-d3c47f165446	YOUTUBE	System Design Interview Basics	https://www.youtube.com/watch?v=dQw4w9WgXcQ	Distributed systems fundamentals and scaling concepts.	A beginner friendly system design video.	https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg	Tech Channel	{"videoId": "dQw4w9WgXcQ", "channelName": "Tech Channel", "publishedAt": "2026-05-20T10:00:00Z", "durationSeconds": 1250}	4	2026-05-31 14:05:31.812	2026-05-31 14:05:31.812	f	\N	f
4701f87f-706d-4242-ae80-5c842b30803e	YOUTUBE	System Design Interview Basics	https://www.youtube.com/watch?v=_hKIiCSvYw0	Distributed systems fundamentals and scaling concepts.	A beginner friendly system design video.	https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg	Tech Channel	{"videoId": "dQw4w9WgXcQ", "channelName": "Tech Channel", "publishedAt": "2026-05-20T10:00:00Z", "durationSeconds": 1250}	4	2026-05-31 14:24:56.252	2026-05-31 14:24:56.252	f	\N	f
db062bd4-7bf2-43ad-ac93-0b74da0fba8a	YOUTUBE	System Design Interview Basics	https://www.youtube.com/watch?v=_hKIiCSvYw0	Distributed systems fundamentals and scaling concepts.	A beginner friendly system design video.	https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg	Tech Channel	{"videoId": "dQw4w9WgXcQ", "channelName": "Tech Channel", "publishedAt": "2026-05-20T10:00:00Z", "durationSeconds": 1250}	4	2026-05-31 14:25:57.177	2026-05-31 14:25:57.177	f	\N	f
f24f0903-eccc-439e-aff5-b28bc575a8d5	YOUTUBE	System Design Interview Basics	https://www.youtube.com/watch?v=_hKIiCSvYw0	Distributed systems fundamentals and scaling concepts.	A beginner friendly system design video.	https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg	Tech Channel	{"videoId": "dQw4w9WgXcQ", "channelName": "Tech Channel", "publishedAt": "2026-05-20T10:00:00Z", "durationSeconds": 1250}	4	2026-05-31 14:26:42.433	2026-05-31 14:26:42.433	f	\N	f
5d851007-de65-408f-a904-432e3d9b6ef0	YOUTUBE	System Design Interview Basics	https://www.youtube.com/watch?v=_hKIiCSvYw0	Distributed systems fundamentals and scaling concepts.	A beginner friendly system design video.	https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg	Tech Channel	{"videoId": "dQw4w9WgXcQ", "channelName": "Tech Channel", "publishedAt": "2026-05-20T10:00:00Z", "durationSeconds": 1250}	4	2026-05-31 14:28:12.384	2026-05-31 14:28:12.384	f	\N	f
4de99f99-14d9-4d18-a026-0db7e9e4d795	YOUTUBE	System Design Interview Basics	https://www.youtube.com/watch?v=_hKIiCSvYw0	Distributed systems fundamentals and scaling concepts.	A beginner friendly system design video.	https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg	Tech Channel	{"videoId": "dQw4w9WgXcQ", "channelName": "Tech Channel", "publishedAt": "2026-05-20T10:00:00Z", "durationSeconds": 1250}	4	2026-05-31 14:36:22.613	2026-05-31 14:36:22.613	f	\N	f
1dd26d1e-fd2b-4976-b723-263f9fe7a8b1	YOUTUBE	System Design Interview Basics	https://www.youtube.com/watch?v=_hKIiCSvYw0	Distributed systems fundamentals and scaling concepts.	A beginner friendly system design video.	https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg	Tech Channel	{"videoId": "dQw4w9WgXcQ", "channelName": "Tech Channel", "publishedAt": "2026-05-20T10:00:00Z", "durationSeconds": 1250}	4	2026-05-31 17:58:51.635	2026-05-31 17:58:51.635	f	\N	f
057232b0-891f-4c5a-8803-56af48640d5d	YOUTUBE	System Design Interview Basics	https://www.youtube.com/watch?v=_hKIiCSvYw0	Distributed systems fundamentals and scaling concepts.	A beginner friendly system design video.	https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg	Tech Channel	{"videoId": "dQw4w9WgXcQ", "channelName": "Tech Channel", "publishedAt": "2026-05-20T10:00:00Z", "durationSeconds": 1250}	4	2026-05-31 18:30:57.41	2026-05-31 18:30:57.41	f	\N	f
871f05e2-8923-481f-a253-d512601bb1c5	YOUTUBE	System Design Interview Basics	https://www.youtube.com/watch?v=_hKIiCSvYw0	Distributed systems fundamentals and scaling concepts.	A beginner friendly system design video.	https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg	Tech Channel	null	5	2026-06-01 16:00:24.156	2026-06-01 16:14:55.996	t	\N	f
e78fa482-c07c-4f77-9ef3-e587f4ff6f43	WEBSITE	System Design Interview Basics	https://www.youtube.com/watch?v=_hKIiCSvYw0	Distributed systems fundamentals and scaling concepts.	How to train your brain to focus betterStrategies like time-blocking, quitting social media intentionally, and creating a deep work routine✅️Dm for personal ...	https://i.ytimg.com/vi/_hKIiCSvYw0/maxresdefault.jpg	Tech Channel	null	5	2026-06-02 19:47:36.598	2026-06-02 19:50:09.461	t	This book Changed my life	f
b61a1e16-4350-4259-816a-ea5d6aaf75ec	YOUTUBE	System Design Interview Basics	https://www.youtube.com/watch?v=_hKIiCSvYw0	Distributed systems fundamentals and scaling concepts.	How to train your brain to focus betterStrategies like time-blocking, quitting social media intentionally, and creating a deep work routine✅️Dm for personal ...	https://i.ytimg.com/vi/_hKIiCSvYw0/maxresdefault.jpg	Tech Channel	{"url": "https://www.youtube.com/watch?v=_hKIiCSvYw0", "type": "video.other", "site_name": "YouTube"}	5	2026-06-02 19:53:01.872	2026-06-02 19:53:01.872	f	This book Changed my life	f
dc087986-d957-421e-8f4e-4991004a8908	YOUTUBE	Master Design Interview Basics	https://www.youtube.com/watch?v=_hKIiCSvYw0	Master Distributed systems fundamentals and scaling concepts.	How to train your brain to focus betterStrategies like time-blocking, quitting social media intentionally, and creating a deep work routine✅️Dm for personal ...	https://i.ytimg.com/vi/_hKIiCSvYw0/maxresdefault.jpg	Tech Channel	{"url": "https://www.youtube.com/watch?v=_hKIiCSvYw0", "type": "video.other", "site_name": "YouTube"}	5	2026-06-02 20:06:40.387	2026-06-02 20:06:40.387	f	This book Changed my life	f
050bde56-eefa-4555-87d9-63c1e9da3000	WEBSITE	Master Design Interview Basics	https://youtu.be/3baWzvEDfgU?si=RPrs0RrHndo-Q9xI	Master Distributed systems fundamentals and scaling concepts.	Find all openings here: https://next-level.onelink.me/vJGp/w4q7i17k  Apply now, windows for application will be closing soon. I and @gkcs have prepared this ...	https://i.ytimg.com/vi/3baWzvEDfgU/maxresdefault.jpg	Tech Channel	{"url": "https://www.youtube.com/watch?v=3baWzvEDfgU", "type": "video.other", "site_name": "YouTube"}	5	2026-06-02 20:07:27.753	2026-06-02 20:07:27.753	f	[Complete] System Design Roadmap with Videos/Blogs for Everyone - Interviews and Kickstart Career	f
00e20f28-680c-4ccf-bd4d-6638d370b600	WEBSITE	Master Design Interview Basics	https://youtu.be/3baWzvEDfgU?si=RPrs0RrHndo-Q9xI	Master Distributed systems fundamentals and scaling concepts.	Find all openings here: https://next-level.onelink.me/vJGp/w4q7i17k  Apply now, windows for application will be closing soon. I and @gkcs have prepared this ...	https://i.ytimg.com/vi/3baWzvEDfgU/maxresdefault.jpg	Tech Channel	{"url": "https://www.youtube.com/watch?v=3baWzvEDfgU", "type": "video.other", "site_name": "YouTube"}	5	2026-06-02 20:07:50.774	2026-06-02 20:07:50.774	f	[Complete] System Design Roadmap with Videos/Blogs for Everyone - Interviews and Kickstart Career	f
9ed14c76-9e54-4381-8853-c297ae4919e2	YOUTUBE	Master Design Interview Basics	https://youtu.be/3baWzvEDfgU?si=RPrs0RrHndo-Q9xI	Master Distributed systems fundamentals and scaling concepts.	Find all openings here: https://next-level.onelink.me/vJGp/w4q7i17k  Apply now, windows for application will be closing soon. I and @gkcs have prepared this ...	https://i.ytimg.com/vi/3baWzvEDfgU/maxresdefault.jpg	Tech Channel	{"url": "https://www.youtube.com/watch?v=3baWzvEDfgU", "type": "video.other", "site_name": "YouTube"}	5	2026-06-02 20:08:36.218	2026-06-02 20:08:36.218	f	[Complete] System Design Roadmap with Videos/Blogs for Everyone - Interviews and Kickstart Career	f
6d6c529a-615c-4928-9759-2bbd2f9564e0	WEBSITE	Master Design Interview Basics	https://x.com/priyankapudi/status/2063257049778270311?s=20	Research Paper on TTS voice agents	\N	\N	priyanka	{"url": null, "type": null, "site_name": "X (formerly Twitter)"}	5	2026-06-06 18:04:08.645	2026-06-06 18:04:08.645	f	\N	f
f2499bc8-5d62-4829-9c17-6c03d46615ae	WEBSITE	Research Paper on TTS voice agents	https://x.com/priyankapudi/status/2063257049778270311?s=20	Research Paper on TTS voice agents	\N	\N	priyanka	{"url": null, "type": null, "site_name": "X (formerly Twitter)"}	5	2026-06-06 18:09:58.397	2026-06-06 18:09:58.397	f	\N	f
34a2f996-37d1-4d69-beab-8036e874a6b8	WEBSITE	Research Paper on TTS voice agents	https://x.com/priyankapudi/status/2063257049778270311?s=20	Research Paper on TTS voice agents	\N	\N	priyanka	{"url": null, "type": null, "site_name": "X (formerly Twitter)"}	5	2026-06-06 18:10:26.647	2026-06-06 18:10:26.647	f	\N	f
8278ecad-eb97-4383-927a-29c96ae769c7	YOUTUBE	Vibe coding beautiful UIs in 3 simple steps	https://youtu.be/p_q7-iW606U?si=o0OyXyoTdQdf-uQw	\N	Stop making ugly AI-generated UIs powered by unmaintainable code and do this instead.I'll share the secret to getting AI to produce actually good code and ni...	https://i.ytimg.com/vi/p_q7-iW606U/maxresdefault.jpg	\N	{"url": "https://www.youtube.com/watch?v=p_q7-iW606U", "type": "video.other", "site_name": "YouTube"}	6	2026-06-07 11:12:41.189	2026-06-07 11:12:41.189	f	Vibe coding beautiful UIs in 3 simple steps	f
4802a557-eab6-42ed-9a06-483a0a23eee9	WEBSITE	Notion | Where teams and agents work together	https://app.notion.com/p/devakinandan/Devops-35d8662b21bb80a89420c8bc251fe4ad	\N	A collaborative AI workspace, built on your company context. Build and orchestrate agents right alongside your team's projects, meetings, and connected apps.	https://app.notion.com/images/meta/default.png	\N	{"url": "https://app.notion.com", "type": "website", "site_name": "Notion"}	6	2026-06-07 11:33:41.958	2026-06-07 11:33:41.958	f	Notion | Where teams and agents work together	f
7367557b-43d9-4176-a9e6-b6f64ee74cdf	WEBSITE	https://x.com/priyankapudi/status/2063257049778270311?s=20	https://x.com/priyankapudi/status/2063257049778270311?s=20	\N	\N	\N	\N	{"url": null, "type": null, "site_name": "X (formerly Twitter)"}	6	2026-06-07 11:39:39.632	2026-06-07 11:39:39.632	f	\N	f
bf363998-ff9e-4b82-98c4-06b3e6f8b509	WEBSITE	https://x.com/priyankapudi/status/2063257049778270311?s=20	https://x.com/priyankapudi/status/2063257049778270311?s=20	\N	\N	\N	\N	{"url": null, "type": null, "site_name": "X (formerly Twitter)"}	6	2026-06-07 11:40:03.186	2026-06-07 11:40:03.186	f	\N	f
4be662d1-64f0-46f1-952a-3196af2d0c5c	WEBSITE	Discover community-made UI components | 21st	https://21st.dev/community/components	\N	Explore, copy, and remix thousands of high-quality React components published to the 21st.dev Community by designers and developers.	https://21st.dev/opengraph-image.png	\N	{"url": null, "type": "website", "site_name": "21st"}	6	2026-06-07 11:40:23.038	2026-06-07 11:40:23.038	f	Discover community-made UI components | 21st	f
43b237f6-b446-4734-b24b-55ab30322c3b	YOUTUBE	I made 65 LPA as a Software Engineer in India (Full Story)	https://youtu.be/FLNCDsbrlJ0?si=JMOp0pweVFUXAVDQ	\N	If you'd like a 1:1 session with me to discuss about your career, then book a call with me: https://topmate.io/manisha_naiduI made ₹65 LPA as a Software Engi...	https://i.ytimg.com/vi/FLNCDsbrlJ0/maxresdefault.jpg	\N	{"url": "https://www.youtube.com/watch?v=FLNCDsbrlJ0", "type": "video.other", "site_name": "YouTube"}	6	2026-06-07 12:31:10.778	2026-06-07 12:31:10.778	f	I made 65 LPA as a Software Engineer in India (Full Story)	f
619dbfae-139b-4c88-a27a-e57fe8889f83	WEBSITE	https://x.com/RobertGreene/status/2063244525678817676?s=20	https://x.com/RobertGreene/status/2063244525678817676?s=20	\N	\N	\N	\N	{"url": null, "type": null, "site_name": "X (formerly Twitter)"}	7	2026-06-07 18:18:00.663	2026-06-07 18:18:00.663	f	\N	f
7c2dc8c9-b318-4b02-8891-b86f7b5bf9bc	WEBSITE	https://x.com/RobertGreene/status/2063244525678817676?s=20	https://x.com/RobertGreene/status/2063244525678817676?s=20	\N	\N	\N	\N	{"url": null, "type": null, "site_name": "X (formerly Twitter)"}	7	2026-06-07 18:18:47.637	2026-06-07 18:18:47.637	f	\N	f
280512ae-bef3-4d6a-abc2-aac2842ffa80	TWITTER	https://x.com/RobertGreene/status/2063244525678817676?s=20	https://x.com/RobertGreene/status/2063244525678817676?s=20			\N	\N	null	7	2026-06-07 18:19:32.895	2026-06-07 18:21:23.621	f	\N	f
c3e57ca0-5fbe-45d6-8968-7bd9c863de77	TWITTER	https://x.com/RobertGreene/status/2063244525678817676?s=20	https://x.com/RobertGreene/status/2063244525678817676?s=20	\N	\N	\N	\N	{"url": null, "type": null, "site_name": "X (formerly Twitter)"}	7	2026-06-07 18:31:16.884	2026-06-07 18:31:16.884	f	\N	f
c7e38b58-33f5-449d-bdc0-225eaf6c3f2c	YOUTUBE	The Hard Truths I Learned While Living Alone	https://youtu.be/kwP6zPpSA50?si=em-9-sHWj7aQtNuW	new new notes 23234234234 fdgefdg	Last year was one of the hardest years of my life.I was living alone, dealing with a handling work, managing my home, cooking my own meals, and trying to sta...	https://i.ytimg.com/vi/kwP6zPpSA50/maxresdefault.jpg	\N	null	7	2026-06-07 17:56:36.555	2026-06-07 18:24:53.249	f	The Hard Truths I Learned While Living Alone	f
d5111f39-b1ef-4b0f-9bdc-a548f0bcadd8	YOUTUBE	How to make vibe coding not suck…	https://youtu.be/PLKrSVuT-Dg?si=-wWJ_S_vd4_jhTrZ	1. a way for coding agents to talk to external agents\n2. remote server or third party api, this is working good\n	Deploy your app the easy way with Sevalla and get $50 in free credits - https://sevalla.com/fireshipAI coding may be overhyped but Model Context Protocols ar...  bmm	https://i.ytimg.com/vi/PLKrSVuT-Dg/maxresdefault.jpg	\N	null	7	2026-06-09 13:51:01.721	2026-06-09 18:54:20.872	f	How to make vibe coding not suck…	f
83bf9d63-5a08-4013-8163-354573bcef23	WEBSITE	The Most Important Question of Your Life	https://markmanson.net/question	\N	The most important question you will ever ask yourself might surprise you. Find out what it is here.	https://markmanson.net/wp-content/uploads/2013/11/most-important-question.jpg	\N	null	7	2026-06-07 18:39:06.71	2026-06-08 18:52:12.662	f	The Most Important Question of Your Life	t
3fc61b24-d355-4e1b-90f0-a4471d20991e	WEBSITE	Copy of Top1_Backend_Roadmap	https://docs.google.com/document/d/1iYQs3ZmA3HTDF1FJmMLHlLg-4g5MuZ6pg5pWJ5LP71g/edit?usp=sharing	why clear, working	befoere you start, do it again\n	https://lh7-us.googleusercontent.com/docs/AHkbwyKGcf-3C8lalUR0nOMof_ezIGiMVEu7cbhkQx5T9X672rFgWgfesngzitWNChlsvFAVY0se_QsGwgjr32kLi9OVAMpM3-K4csg5Lh8vyAEpNgw12hmC=w1200-h630-p	\N	null	7	2026-06-07 18:37:29.113	2026-06-08 18:52:21.69	f	Copy of Top1_Backend_Roadmap	t
57438ace-1dcc-495f-930b-48e1cb67a448	YOUTUBE	Vibe Coding for Beginners (Full Course 2026)	https://youtu.be/BpOsHF5Oj_I?si=0Q6vu87swKUqrFOR	\N	Vibe Coding with Codex - Complete GuideBuild a Web App, Desktop App & iOS App with Codex + GPT‑5.5(No Coding Needed, Beginner Friendly)In this video you will...	https://i.ytimg.com/vi/BpOsHF5Oj_I/maxresdefault.jpg	\N	{"url": "https://www.youtube.com/watch?v=BpOsHF5Oj_I", "type": "video.other", "site_name": "YouTube"}	7	2026-06-08 19:05:33.758	2026-06-08 19:05:33.758	f	Vibe Coding for Beginners (Full Course 2026)	f
dfc69d0e-9546-40af-beab-4c8e838daaf6	WEBSITE	Top View of BT - TUF+	https://takeuforward.org/plus/dsa/problems/top-view-of-bt?subject=dsa&approach=optimal&sidebar=open	this is suprising	this is begining\nLorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia. Nam pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris. Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus. Vestibulum volutpat pretium libero. Cras id dui. Aenean ut eros et nisl sagittis vestibulum. Nullam nulla eros, ultricies sit amet, nonummy id, imperdiet feugiat, pede. Sed lectus. Donec mollis hendrerit risus. Phasellus nec sem in justo pellentesque facilisis. Etiam imperdiet imperdiet orci. Nunc nec neque. Phasellus leo dolor, tempus non, auctor et, hendrerit quis, nisi. Curabitur ligula sapien, tincidunt non, euismod vitae, posuere imperdiet, leo. Maecenas malesuada. Praesent congue erat at massa. Sed cursus turpis vitae tortor. Donec posuere vulputate arcu. Phasellus accumsan cursus velit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Sed aliquam, nisi quis porttitor congue, elit erat euismod orci, ac placerat dolor lectus quis orci. Phasellus consectetuer vestibulum elit. Aenean tellus metus, bibendum sed, posuere ac, mattis non, nunc. Vestibulum fringilla pede sit amet augue. In turpis. Pellentesque posuere. Praesent turpis. Aenean posuere, tortor sed cursus feugiat, nunc augue blandit nunc, eu sollicitudin urna dolor sagittis lacus. Donec elit libero, sodales nec, volutpat a, suscipit non, turpis. Nullam sagittis. Suspendisse pulvinar, augue ac venenatis condimentum, sem libero volutpat nibh, nec pellentesque velit pede quis nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Fusce id purus. Ut varius tincidunt libero. Phasellus dolor. Maecenas vestibulum mollis diam. Pellentesque ut neque. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. In dui magna, posuere eget, vestibulum et, tempor auctor, justo. In ac felis quis tortor malesuada pretium. Pellentesque auctor neque nec urna. Proin sapien ipsum, porta a, auctor quis, euismod ut, mi. Aenean viverra rhoncus pede. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Ut non enim eleifend felis pretium feugiat. Vivamus quis mi. Phasellus a est. Phasellus magna. In hac habitasse platea dictumst. Curabitur at lacus ac velit ornare lobortis. Curabitur a felis in nunc fringilla tristique. Morbi mattis ullamcorper velit. Phasellus gravida semper nisi. Nullam vel sem. Pellentesque libero tortor, tincidunt et, tincidunt eget, semper nec, quam. Sed hendrerit. Morbi ac felis. Nunc egestas, augue at pellentesque laoreet, felis eros vehicula leo, at malesuada velit leo quis pede. Donec interdum, metus et hendrerit aliquet, dolor diam sagittis ligula, eget egestas libero turpis vel mi. Nunc nulla. Fusce risus nisl, viverra et, tempor et, pretium in, sapien. Donec venenatis vulputate lorem. Morbi nec metus. Phasellus blandit leo ut odio. Maecenas ullamcorper, dui et placerat feugiat, eros pede varius nisi, condimentum viverra felis nunc et lorem. Sed magna purus, fermentum eu, tincidunt eu, varius ut, felis. In auctor lobortis lacus. Quisque libero metus, condimentum nec, tempor a, commodo mollis, magna. Vestibulum ullamcorper mauris at ligula. Fusce fermentum. Nullam cursus lacinia erat. Praesent blandit laoreet nibh. Fusce convallis metus id felis luctus adipiscing. Pellentesque egestas, neque sit amet convallis pulvinar, justo nulla eleifend augue, ac auctor orci leo non est. Quisque id mi. Ut tincidunt tincidunt erat. Etiam feugiat lorem non metus. Vestibulum dapibus nunc ac augue. Curabitur vestibulum aliquam leo. Praesent egestas neque eu enim. In hac habitasse platea dictumst. Fusce a quam. Etiam ut purus mattis mauris sodales aliquam. Curabitur nisi. Quisque malesuada placerat nisl. Nam ipsum risus, rutrum vitae, vestibulum eu, molestie vel, lacus. Sed augue ipsum, egestas nec, vestibulum et, malesuada adipiscing, dui. Vestibulum facilisis, purus nec pulvinar iaculis, ligula mi congue nunc, vitae euismod ligula urna in dolor. Mauris sollicitudin fermentum libero. Praesent nonummy mi in odio. Nunc interdum lacus sit amet orci. Vestibulum rutrum, mi nec elementum vehicula, eros quam gravida nisl, id fringilla neque ante vel mi. Morbi mollis tellus ac sapien. Phasellus volutpat, metus eget egestas mollis, lacus lacus blandit dui, id egestas quam mauris ut lacus. Fusce vel dui. Sed in libero ut nibh placerat accumsan. Proin faucibus arcu quis ante. In consectetuer turpis ut velit. Nulla sit amet est. Praesent metus tellus, elementum eu, semper a, adipiscing nec, purus. Cras risus ipsum, faucibus ut, ullamcorper id, varius ac, leo. Suspendisse feugiat. Suspendisse enim turpis, dictum sed, iaculis a, condimentum nec, nisi. Praesent nec nisl a purus blandit viverra. Praesent ac massa at ligula laoreet iaculis. Nulla neque dolor, sagittis eget, iaculis quis, molestie non, velit. Mauris turpis nunc, blandit et, volutpat molestie, porta ut, ligula. Fusce pharetra convallis urna. Quisque ut nisi. Donec mi odio, faucibus at, scelerisque quis, convallis in, nisi. Suspendisse non nisl sit amet velit hendrerit rutrum. Ut leo. Ut a nisl id ante tempus hendrerit. Proin pretium, leo ac pellentesque mollis, felis nunc ultrices eros, sed gravida augue augue mollis justo. Suspendisse eu ligula. Nulla facilisi. Donec id justo. Praesent porttitor, nulla vitae posuere iaculis, arcu nisl dignissim dolor, a pretium mi sem ut ipsum. Curabitur suscipit suscipit tellus. Praesent vestibulum dapibus nibh. Etiam iaculis nunc ac metus. Ut id nisl quis enim dignissim sagittis. Etiam sollicitudin, ipsum eu pulvinar rutrum, tellus ipsum laoreet sapien, quis venenatis ante odio sit amet eros. Proin magna. Duis vel nibh at velit scelerisque suscipit. Curabitur turpis. Vestibulum suscipit nulla quis orci. Fusce ac felis sit amet ligula pharetra condimentum. Maecenas egestas arcu quis ligula mattis placerat. Duis lobortis massa imperdiet quam. Suspendisse potenti. Pellentesque commodo eros a enim. Vestibulum turpis sem, aliquet eget, lobortis pellentesque, rutrum eu, nisl. Sed libero. Aliquam erat volutpat. Etiam vitae tortor. Morbi vestibulum volutpat enim. Aliquam eu nunc. Nunc sed turpis. Sed mollis, eros et ultrices tempus, mauris ipsum aliquam libero, non adipiscing dolor urna a orci. Nulla porta dolor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Pellentesque dapibus hendrerit tortor. Praesent egestas tristique nibh. Sed a libero. Cras varius. Donec vitae orci sed dolor rutrum auctor. Fusce egestas elit eget lorem. Suspendisse nisl elit, rhoncus eget, elementum ac, condimentum eget, diam. Nam at tortor in tellus interdum sagittis. Aliquam lobortis. Donec orci lectus, aliquam ut, faucibus non, euismod id, nulla. Curabitur blandit mollis lacus. Nam adipiscing. Vestibulum eu odio. Vivamus laoreet. Nullam tincidunt adipiscing enim. Phasellus tempus. Proin viverra, ligula sit amet ultrices semper, ligula arcu tristique sapien, a accumsan nisi mauris ac eros. Fusce neque. Suspendisse faucibus, nunc et pellentesque egestas, lacus ante convallis tellus, vitae iaculis lacus elit id tortor. Vivamus aliquet elit ac nisl. Fusce fermentum odio nec arcu. Vivamus euismod mauris. In ut quam vitae odio lacinia tincidunt. Praesent ut ligula non mi varius sagittis. Cras sagittis. Praesent ac sem eget est egestas volutpat. Vivamus consectetuer hendrerit lacus. Cras non dolor. Vivamus in erat ut urna cursus vestibulum. Fusce commodo aliquam arcu. Nam commodo suscipit quam. Quisque id odio. Praesent venenatis metus at tortor pulvinar varius.Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia. Nam pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris. Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus. Vestibulum volutpat pretium libero. Cras id dui. Aenean ut eros et nisl sagittis vestibulum. Nullam nulla eros, ultricies sit amet, nonummy id, imperdiet feugiat, pede. Sed lectus. Donec mollis hendrerit risus. Phasellus nec sem in	https://static.takeuforward.org/content/tuf_link_sharing_img-RyY02Yv4	\N	null	7	2026-06-07 18:42:28.23	2026-06-09 18:57:19.49	f	Top View of BT - TUF+	f
0683c91f-8d47-449a-8dd2-c9f3a6a476f5	YOUTUBE	How To Get The Most Out Of Vibe Coding | Startup School	https://youtu.be/BJjsfNO5JTo?si=Ww67iLORZW-Bv0Fv	- startup funding is called serseri A, jfksjdlf	AI can't yet one-shot an entire product—but with the rise of vibe coding, it's getting close.  YC's Tom Blomfield has spent the last month building side proj...	https://i.ytimg.com/vi/BJjsfNO5JTo/maxresdefault.jpg	\N	null	7	2026-06-11 08:41:37.055	2026-06-11 08:42:37.759	f	How To Get The Most Out Of Vibe Coding | Startup School	f
53dbf826-3dde-4772-b98f-e7025f65806c	YOUTUBE	WWDC 2026 - Siri AI Impressions!	https://youtu.be/c6HGJJabr_4?si=4XPea7kB2YoCdhcw	testing expanded view\n	Apple WWDC Impressions - Siri AI is....Interesting. They can't harm you, if they can't find you! Use code BOSS at the link below and get 60% off an annual pl...	https://i.ytimg.com/vi/c6HGJJabr_4/maxresdefault.jpg	\N	null	7	2026-06-09 13:43:29.43	2026-06-09 13:47:31.335	f	WWDC 2026 - Siri AI Impressions!	f
721866e6-c33e-4822-8183-6db3e56a6ea9	INTERNAL	just tage chekcong	https://second-brain.app/note	just tagskmlkm		\N	\N	null	7	2026-06-09 19:11:57.145	2026-06-09 19:36:29.858	f	\N	f
fe1e8539-79c0-4b14-a096-9bd73f91cbbd	INTERNAL	this is test	https://second-brain.app/note	Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integnknk,ner tincidunt.flksdjfldjf Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia. Nam pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris. Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus. Vestibulum volutpat pretium libero. Cras id dui. Aenean ut eros et nisl sagittis vestibulum. Nullam nulla eros, ultricies sit amet, nonummy id, imperdiet feugiat, pede. Sed lectus. Donec mollis hendrerit risus. Phasellus nec sem in justo pellentesque facilisis. Etiam imperdiet imperdiet orci. Nunc nec neque. Phasellus leo dolor, tempus non, auctor et, hendrerit quis, nisi. Curabitur ligula sapien, tincidunt non, euismod vitae, posuere imperdiet, leo. Maecenas malesuada. Praesent congue erat at massa. Sed cursus turpis vitae tortor. Donec posuere vulputate arcu. Phasellus accumsan cursus velit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Sed aliquam, nisi quis porttitor congue, elit erat euismod orci, ac placerat dolor lectus quis orci. Phasellus consectetuer vestibulum elit. Aenean tellus metus, bibendum sed, posuere ac, mattis non, nunc. Vestibulum fringilla pede sit amet augue. In turpis. Pellentesque posuere. Praesent turpis. Aenean posuere, tortor sed cursus feugiat, nunc augue blandit nunc, eu sollicitudin urna dolor sagittis lacus. Donec elit libero, sodales nec, volutpat a, suscipit non, turpis. Nullam sagittis. Suspendisse pulvinar, augue ac venenatis condimentum, sem libero volutpat nibh, nec pellentesque velit pede quis nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Fusce id purus. Ut varius tincidunt libero. Phasellus dolor. Maecenas vestibulum mollis diam. Pellentesque ut neque. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. In dui magna, posuere eget, vestibulum et, tempor auctor, justo. In ac felis quis tortor malesuada pretium. Pellentesque auctor neque nec urna. Proin sapien ipsum, porta a, auctor quis, euismod ut, mi. Aenean viverra rhoncus pede. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Ut non enim eleifend felis pretium feugiat. Vivamus quis mi. Phasellus a est. Phasellus magna. In hac habitasse platea dictumst. Curabitur at lacus ac velit ornare lobortis. Curabitur a felis in nunc fringilla tristique. Morbi mattis ullamcorper velit. Phasellus gravida semper nisi. Nullam vel sem. Pellentesque libero tortor, tincidunt et, tincidunt eget, semper nec, quam. Sed hendrerit. Morbi ac felis. Nunc egestas, augue at pellentesque laoreet, felis eros vehicula leo, at malesuada velit leo quis pede. Donec interdum, metus et hendrerit aliquet, dolor diam sagittis ligula, eget egestas libero turpis vel mi. Nunc nulla. Fusce risus nisl, viverra et, tempor et, pretium in, sapien. Donec venenatis vulputate lorem. Morbi nec metus. Phasellus blandit leo ut odio. Maecenas ullamcorper, dui et placerat feugiat, eros pede varius nisi, condimentum viverra felis nunc et lorem. Sed magna purus, fermentum eu, tincidunt eu, varius ut, felis. In auctor lobortis lacus. Quisque libero metus, condimentum nec, tempor a, commodo mollis, magna. Vestibulum ullamcorper mauris at ligula. Fusce fermentum. Nullam cursus lacinia erat. Praesent blandit laoreet nibh. Fusce convallis metus id felis luctus adipiscing. Pellentesque egestas, neque sit amet convallis pulvinar, justo nulla eleifend augue, ac auctor orci leo non est. Quisque id mi. Ut tincidunt tincidunt erat. Etiam feugiat lorem non metus. Vestibulum dapibus nunc ac augue. Curabitur vestibulum aliquam leo. Praesent egestas neque eu enim. In hac habitasse platea dictumst. Fusce a quam. Etiam ut purus mattis mauris sodales aliquam. Curabitur nisi. Quisque malesuada placerat nisl. Nam ipsum risus, rutrum vitae, vestibulum eu, molestie vel, lacus. Sed augue ipsum, egestas nec, vestibulum et, malesuada adipiscing, dui. Vestibulum facilisis, purus nec pulvinar iaculis, ligula mi congue nunc, vitae euismod ligula urna in dolor. Mauris sollicitudin fermentum libero. Praesent nonummy mi in odio. Nunc interdum lacus sit amet orci. Vestibulum rutrum, mi nec elementum vehicula, eros quam gravida nisl, id fringilla neque ante vel mi. Morbi mollis tellus ac sapien. Phasellus volutpat, metus eget egestas mollis, lacus lacus blandit dui, id egestas quam mauris ut lacus. Fusce vel dui. Sed in libero ut nibh placerat accumsan. Proin faucibus arcu quis ante. In consectetuer turpis ut velit. Nulla sit amet est. Praesent metus tellus, elementum eu, semper a, adipiscing nec, purus. Cras risus ipsum, faucibus ut, ullamcorper id, varius ac, leo. Suspendisse feugiat. Suspendisse enim turpis, dictum sed, iaculis a, condimentum nec, nisi. Praesent nec nisl a purus blandit viverra. Praesent ac massa at ligula laoreet iaculis. Nulla neque dolor, sagittis eget, iaculis quis, molestie non, velit. Mauris turpis nunc, blandit et, volutpat molestie, porta ut, ligula. Fusce pharetra convallis urna. Quisque ut nisi. Donec mi odio, faucibus at, scelerisque quis, convallis in, nisi. Suspendisse non nisl sit amet velit hendrerit rutrum. Ut leo. Ut a nisl id ante tempus hendrerit. Proin pretium, leo ac pellentesque mollis, felis nunc ultrices eros, sed gravida augue augue mollis justo. Suspendisse eu ligula. Nulla facilisi. Donec id justo. Praesent porttitor, nulla vitae posuere iaculis, arcu nisl dignissim dolor, a pretium mi sem ut ipsum. Curabitur suscipit suscipit tellus. Praesent vestibulum dapibus nibh. Etiam iaculis nunc ac metus. Ut id nisl quis enim dignissim sagittis. Etiam sollicitudin, ipsum eu pulvinar rutrum, tellus ipsum laoreet sapien, quis venenatis ante odio sit amet eros. Proin magna. Duis vel nibh at velit scelerisque suscipit. Curabitur turpis. Vestibulum suscipit nulla quis orci. Fusce ac felis sit amet ligula pharetra condimentum. Maecenas egestas arcu quis ligula mattis placerat. Duis lobortis massa imperdiet quam. Suspendisse potenti. Pellentesque commodo eros a enim. Vestibulum turpis sem, aliquet eget, lobortis pellentesque, rutrum eu, nisl. Sed libero. Aliquam erat volutpat. Etiam vitae tortor. Morbi vestibulum volutpat enim. Aliquam eu nunc. Nunc sed turpis. Sed mollis, eros et ultrices tempus, mauris ipsum aliquam libero, non adipiscing dolor urna a orci. Nulla porta dolor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Pellentesque dapibus hendrerit tortor. Praesent egestas tristique nibh. Sed a libero. Cras varius. Donec vitae orci sed dolor rutrum auctor. Fusce egestas elit eget lorem. Suspendisse nisl elit, rhoncus eget, elementum ac, condimentum eget, diam. Nam at tortor in tellus interdum sagittis. Aliquam lobortis. Donec orci lectus, aliquam ut, faucibus non, euismod id, nulla. Curabitur blandit mollis lacus. Nam adipiscing. Vestibulum eu odio. Vivamus laoreet. Nullam tincidunt adipiscing enim. Phasellus tempus. Proin viverra, ligula sit amet ultrices semper, ligula arcu tristique sapien, a accumsan nisi mauris ac eros. Fusce neque. Suspendisse faucibus, nunc et pellentesque egestas, lacus ante convallis tellus, vitae iaculis lacus elit id tortor. Vivamus aliquet elit ac nisl. Fusce fermentum odio nec arcu. Vivamus euismod mauris. In ut quam vitae odio lacinia tincidunt. Praesent ut ligula non mi varius sagittis. Cras sagittis. Praesent ac sem eget est egestas volutpat. Vivamus consectetuer hendrerit lacus. Cras non dolor. Vivamus in erat ut urna cursus vestibulum. Fusce commodo aliquam arcu. Nam commodo suscipit quam. Quisque id odio. Praesent venenatis metus at tortor pulvinar varius.Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia. Nam pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris. Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus. Vestibulum volutpat pretium libero. Cras id dui. Aenean ut eros et nisl sagittis vestibulum. Nullam nulla eros, ultricies sit amet, nonummy id, imperdiet feugiat, pede. Sed lectus. Donec mollis hendrerit risus. Phasellus nec sem in		\N	\N	null	7	2026-06-09 17:36:13.469	2026-06-09 19:39:05.788	f	\N	f
7ac0eff7-f787-483b-8882-9e407ebceb6e	YOUTUBE	Everyone asks me how to get a remote job.	https://youtu.be/RN8R4KJJtFc?si=0WH6fFzb-jKaXypO	\N	Remote jobs are easily the most requested topic I get asked about, so I wanted to share the exact strategy that actually works. If you're tired of sending ou...	https://i.ytimg.com/vi/RN8R4KJJtFc/maxresdefault.jpg	\N	{"url": "https://www.youtube.com/watch?v=RN8R4KJJtFc", "type": "video.other", "site_name": "YouTube"}	7	2026-06-10 18:09:48.448	2026-06-10 18:09:48.448	f	Everyone asks me how to get a remote job.	f
fb31ea6f-f6cd-4d5e-8842-af5633390647	YOUTUBE	What It's Like to Be Homeschooled in India | Homeschooled Kids Reveal!	https://youtu.be/NpSvVXYG18U?si=UHRNdVTlkbrc6-SO	\N	Is homeschooling possible in India? I interviewed homeschooled kids to hear their stories! These children share what it's like to study outside traditional s...	https://i.ytimg.com/vi/NpSvVXYG18U/maxresdefault.jpg	\N	{"url": "https://www.youtube.com/watch?v=NpSvVXYG18U", "type": "video.other", "site_name": "YouTube"}	7	2026-06-11 08:32:32.209	2026-06-11 08:32:32.209	f	What It's Like to Be Homeschooled in India | Homeschooled Kids Reveal!	f
\.


--
-- Data for Name: ShareLink; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ShareLink" (id, hash, "userId", "createdAt", "updatedAt", "isActive") FROM stdin;
1	30ff306c-98c9-4066-b121-6170588eb7bf	1	2026-05-27 18:01:03.379	2026-05-27 18:04:38.676	t
2	97aea5bc-46a9-4303-821f-3d2d6af2a06f	2	2026-05-27 18:05:24.085	2026-05-27 18:05:24.085	t
3	ab33348d-c6fc-4144-95c3-04fe2ea53d79	3	2026-05-27 18:09:53.568	2026-05-27 18:10:16.584	t
4	c3f1a269-e5e7-4d5e-a1a6-b300977f728e	4	2026-05-27 18:28:30.081	2026-05-31 09:28:40.963	t
5	240a667b-c2ca-4bf3-bc98-5e5073ef03b0	5	2026-06-01 16:01:13.931	2026-06-01 16:01:13.931	t
\.


--
-- Data for Name: Tag; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Tag" (id, title, "createdAt", "updatedAt") FROM stdin;
1	system-design	2026-05-25 15:43:52.713	2026-05-25 15:43:52.713
2	backend	2026-05-25 15:43:52.713	2026-05-25 15:43:52.713
3	scaling	2026-05-25 15:43:52.713	2026-05-25 15:43:52.713
4	agent	2026-06-06 18:04:08.645	2026-06-06 18:04:08.645
5	voiceagent	2026-06-06 18:04:08.645	2026-06-06 18:04:08.645
6	researchpaper	2026-06-06 18:04:08.645	2026-06-06 18:04:08.645
7	vibe-coding	2026-06-07 11:12:41.189	2026-06-07 11:12:41.189
8	frontend	2026-06-07 11:12:41.189	2026-06-07 11:12:41.189
9	coding	2026-06-07 11:12:41.189	2026-06-07 11:12:41.189
10	dsa	2026-06-08 18:07:26.295	2026-06-08 18:07:26.295
11	try	2026-06-09 19:11:57.145	2026-06-09 19:11:57.145
12	die	2026-06-09 19:11:57.145	2026-06-09 19:11:57.145
13	cry	2026-06-09 19:11:57.145	2026-06-09 19:11:57.145
14	lie	2026-06-09 19:11:57.145	2026-06-09 19:11:57.145
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, username, password, "createdAt", "updatedAt") FROM stdin;
1	user	$2b$11$n6/Z3X4CLKRRhdDorHKqvuQifj6ir/cOF8oq7nvbQv97C.68AJ9cu	2026-05-25 15:42:50.797	2026-05-25 15:42:50.797
2	thals23	$2b$11$05mm8AQmCgAlWQmaKqxI6uFxeicgtNloUp4pGy6zzWFq0ZAv0ftCC	2026-05-27 18:04:57.235	2026-05-27 18:04:57.235
3	dev23	$2b$11$xOkEij1ECiTnQxtKHyrcFuI0d6cxFs8c6Lh74f9tHDxRwzC7yjYwu	2026-05-27 18:09:07.925	2026-05-27 18:09:07.925
4	dev24	$2b$11$e/3BY9lCPOThyIyl28EV5u0c3iXSo7qyrYZ3SpVmpDrTpj1a.gulG	2026-05-27 18:26:24.47	2026-05-27 18:26:24.47
5	sanjith	$2b$11$7FXzS1/OyfiY91rVb0KK4.9Yzp6BGKZpUcKDYvY6.boiuKjFHivXu	2026-06-01 15:59:04.43	2026-06-01 15:59:04.43
6	Devakinandan	$2b$11$R7zp9nUP3Aemeig4yKuppePsix7BfgHUt2M65l4kS9R9RFNn4R6r.	2026-06-07 10:59:18.404	2026-06-07 10:59:18.404
7	Dev	$2b$11$./foO1bPEATy2lRZzVMIn.R2jnK84mbSBYvvVZBRIMruWZx6QkTR6	2026-06-07 17:56:30.175	2026-06-07 17:56:30.175
\.


--
-- Data for Name: _NoteToTag; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_NoteToTag" ("A", "B") FROM stdin;
a25ac56d-928f-4e57-8679-222bc074a0e8	1
a25ac56d-928f-4e57-8679-222bc074a0e8	2
a25ac56d-928f-4e57-8679-222bc074a0e8	3
b1e890b5-84d0-4d84-bb78-5eeb7291fad8	1
b1e890b5-84d0-4d84-bb78-5eeb7291fad8	2
b1e890b5-84d0-4d84-bb78-5eeb7291fad8	3
17311463-6c53-48e5-b103-b186bfeab155	1
17311463-6c53-48e5-b103-b186bfeab155	2
17311463-6c53-48e5-b103-b186bfeab155	3
255ab079-20eb-471d-96d3-6abd1082603d	1
255ab079-20eb-471d-96d3-6abd1082603d	2
255ab079-20eb-471d-96d3-6abd1082603d	3
e790de5b-a2e1-4391-bd9d-35f7176b28f2	1
e790de5b-a2e1-4391-bd9d-35f7176b28f2	2
e790de5b-a2e1-4391-bd9d-35f7176b28f2	3
84e0483f-3579-4ae6-ab8c-d3c47f165446	1
84e0483f-3579-4ae6-ab8c-d3c47f165446	2
84e0483f-3579-4ae6-ab8c-d3c47f165446	3
4701f87f-706d-4242-ae80-5c842b30803e	1
4701f87f-706d-4242-ae80-5c842b30803e	2
4701f87f-706d-4242-ae80-5c842b30803e	3
db062bd4-7bf2-43ad-ac93-0b74da0fba8a	1
db062bd4-7bf2-43ad-ac93-0b74da0fba8a	2
db062bd4-7bf2-43ad-ac93-0b74da0fba8a	3
f24f0903-eccc-439e-aff5-b28bc575a8d5	1
f24f0903-eccc-439e-aff5-b28bc575a8d5	2
f24f0903-eccc-439e-aff5-b28bc575a8d5	3
5d851007-de65-408f-a904-432e3d9b6ef0	1
5d851007-de65-408f-a904-432e3d9b6ef0	2
5d851007-de65-408f-a904-432e3d9b6ef0	3
4de99f99-14d9-4d18-a026-0db7e9e4d795	1
4de99f99-14d9-4d18-a026-0db7e9e4d795	2
4de99f99-14d9-4d18-a026-0db7e9e4d795	3
1dd26d1e-fd2b-4976-b723-263f9fe7a8b1	1
1dd26d1e-fd2b-4976-b723-263f9fe7a8b1	2
1dd26d1e-fd2b-4976-b723-263f9fe7a8b1	3
057232b0-891f-4c5a-8803-56af48640d5d	1
057232b0-891f-4c5a-8803-56af48640d5d	2
057232b0-891f-4c5a-8803-56af48640d5d	3
871f05e2-8923-481f-a253-d512601bb1c5	1
871f05e2-8923-481f-a253-d512601bb1c5	2
871f05e2-8923-481f-a253-d512601bb1c5	3
e78fa482-c07c-4f77-9ef3-e587f4ff6f43	1
e78fa482-c07c-4f77-9ef3-e587f4ff6f43	2
e78fa482-c07c-4f77-9ef3-e587f4ff6f43	3
b61a1e16-4350-4259-816a-ea5d6aaf75ec	1
b61a1e16-4350-4259-816a-ea5d6aaf75ec	2
b61a1e16-4350-4259-816a-ea5d6aaf75ec	3
dc087986-d957-421e-8f4e-4991004a8908	1
dc087986-d957-421e-8f4e-4991004a8908	2
dc087986-d957-421e-8f4e-4991004a8908	3
050bde56-eefa-4555-87d9-63c1e9da3000	1
050bde56-eefa-4555-87d9-63c1e9da3000	2
050bde56-eefa-4555-87d9-63c1e9da3000	3
00e20f28-680c-4ccf-bd4d-6638d370b600	1
00e20f28-680c-4ccf-bd4d-6638d370b600	2
00e20f28-680c-4ccf-bd4d-6638d370b600	3
9ed14c76-9e54-4381-8853-c297ae4919e2	1
9ed14c76-9e54-4381-8853-c297ae4919e2	2
9ed14c76-9e54-4381-8853-c297ae4919e2	3
6d6c529a-615c-4928-9759-2bbd2f9564e0	4
6d6c529a-615c-4928-9759-2bbd2f9564e0	5
6d6c529a-615c-4928-9759-2bbd2f9564e0	6
f2499bc8-5d62-4829-9c17-6c03d46615ae	4
f2499bc8-5d62-4829-9c17-6c03d46615ae	5
f2499bc8-5d62-4829-9c17-6c03d46615ae	6
34a2f996-37d1-4d69-beab-8036e874a6b8	4
34a2f996-37d1-4d69-beab-8036e874a6b8	5
34a2f996-37d1-4d69-beab-8036e874a6b8	6
8278ecad-eb97-4383-927a-29c96ae769c7	7
8278ecad-eb97-4383-927a-29c96ae769c7	8
8278ecad-eb97-4383-927a-29c96ae769c7	9
57438ace-1dcc-495f-930b-48e1cb67a448	9
dfc69d0e-9546-40af-beab-4c8e838daaf6	10
dfc69d0e-9546-40af-beab-4c8e838daaf6	9
fe1e8539-79c0-4b14-a096-9bd73f91cbbd	9
fe1e8539-79c0-4b14-a096-9bd73f91cbbd	10
721866e6-c33e-4822-8183-6db3e56a6ea9	11
721866e6-c33e-4822-8183-6db3e56a6ea9	12
721866e6-c33e-4822-8183-6db3e56a6ea9	13
721866e6-c33e-4822-8183-6db3e56a6ea9	14
0683c91f-8d47-449a-8dd2-c9f3a6a476f5	11
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
189c5646-b6ba-432d-993b-6fd35b293ffc	73f3bc5fa910ede5e7d787d28a61023d7785d6ab70dec564d03e9f10a46ef0db	2026-05-25 15:37:54.842566+00	20260525153754_init	\N	\N	2026-05-25 15:37:54.822547+00	1
4fc27005-90df-43e1-89fe-3ce1750a3e62	299e5fcdba9139e45035e15f800ad82d4524a6b86953e83bd66e80b4a3bc2e53	2026-05-26 18:31:56.222316+00	20260526183156_share_link_changes	\N	\N	2026-05-26 18:31:56.203235+00	1
0131f343-9a1e-42f2-b8b6-ccec2e85469e	ed0233b0d914a71566fffbbe88b22478e12d6fa882b8c5e001855dc43918f5a4	2026-06-02 18:54:25.54531+00	20260602185425_new_extracted_title_added	\N	\N	2026-06-02 18:54:25.536713+00	1
\.


--
-- Name: ShareLink_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ShareLink_id_seq"', 5, true);


--
-- Name: Tag_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Tag_id_seq"', 14, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_id_seq"', 7, true);


--
-- Name: Note Note_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Note"
    ADD CONSTRAINT "Note_pkey" PRIMARY KEY (id);


--
-- Name: ShareLink ShareLink_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShareLink"
    ADD CONSTRAINT "ShareLink_pkey" PRIMARY KEY (id);


--
-- Name: Tag Tag_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tag"
    ADD CONSTRAINT "Tag_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _NoteToTag _NoteToTag_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_NoteToTag"
    ADD CONSTRAINT "_NoteToTag_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Note_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Note_createdAt_idx" ON public."Note" USING btree ("createdAt");


--
-- Name: Note_sourceType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Note_sourceType_idx" ON public."Note" USING btree ("sourceType");


--
-- Name: Note_title_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Note_title_idx" ON public."Note" USING btree (title);


--
-- Name: Note_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Note_userId_createdAt_idx" ON public."Note" USING btree ("userId", "createdAt");


--
-- Name: Note_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Note_userId_idx" ON public."Note" USING btree ("userId");


--
-- Name: ShareLink_hash_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ShareLink_hash_key" ON public."ShareLink" USING btree (hash);


--
-- Name: ShareLink_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ShareLink_userId_key" ON public."ShareLink" USING btree ("userId");


--
-- Name: Tag_title_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Tag_title_key" ON public."Tag" USING btree (title);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: _NoteToTag_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_NoteToTag_B_index" ON public."_NoteToTag" USING btree ("B");


--
-- Name: Note Note_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Note"
    ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ShareLink ShareLink_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShareLink"
    ADD CONSTRAINT "ShareLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: _NoteToTag _NoteToTag_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_NoteToTag"
    ADD CONSTRAINT "_NoteToTag_A_fkey" FOREIGN KEY ("A") REFERENCES public."Note"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _NoteToTag _NoteToTag_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_NoteToTag"
    ADD CONSTRAINT "_NoteToTag_B_fkey" FOREIGN KEY ("B") REFERENCES public."Tag"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict sg4HbMbsnyp7Zj3T0CPR1Ywk6A0c7aZfekxmUPOzpwFpW0nUmsvNEtTZYAIqd8J

