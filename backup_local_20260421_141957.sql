--
-- PostgreSQL database dump
--

\restrict FeLLjBct6XMKh9xxC2eRAb8rtNhQWXw7m4y2iHzTVe51WKbIvgYKPzv3enUw7fB

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: postgres
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: postgres
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: postgres
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account (
    id text NOT NULL,
    account_id text NOT NULL,
    provider_id text NOT NULL,
    user_id text NOT NULL,
    access_token text,
    refresh_token text,
    id_token text,
    access_token_expires_at timestamp without time zone,
    refresh_token_expires_at timestamp without time zone,
    scope text,
    password text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.account OWNER TO postgres;

--
-- Name: ai_task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_task (
    id text NOT NULL,
    user_id text NOT NULL,
    media_type text NOT NULL,
    provider text NOT NULL,
    model text NOT NULL,
    prompt text NOT NULL,
    options text,
    status text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    deleted_at timestamp without time zone,
    task_id text,
    task_info text,
    task_result text,
    cost_credits integer DEFAULT 0 NOT NULL,
    scene text DEFAULT ''::text NOT NULL,
    credit_id text,
    show_in_gallery integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.ai_task OWNER TO postgres;

--
-- Name: apikey; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.apikey (
    id text NOT NULL,
    user_id text NOT NULL,
    key text NOT NULL,
    title text NOT NULL,
    status text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.apikey OWNER TO postgres;

--
-- Name: chat; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat (
    id text NOT NULL,
    user_id text NOT NULL,
    status text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    model text NOT NULL,
    provider text NOT NULL,
    title text DEFAULT ''::text NOT NULL,
    parts text NOT NULL,
    metadata text,
    content text
);


ALTER TABLE public.chat OWNER TO postgres;

--
-- Name: chat_message; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_message (
    id text NOT NULL,
    user_id text NOT NULL,
    chat_id text NOT NULL,
    status text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    role text NOT NULL,
    parts text NOT NULL,
    metadata text,
    model text NOT NULL,
    provider text NOT NULL
);


ALTER TABLE public.chat_message OWNER TO postgres;

--
-- Name: checkin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.checkin (
    id text NOT NULL,
    user_id text NOT NULL,
    checkin_date text NOT NULL,
    streak integer DEFAULT 1 NOT NULL,
    credits_granted integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.checkin OWNER TO postgres;

--
-- Name: config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.config (
    name text NOT NULL,
    value text
);


ALTER TABLE public.config OWNER TO postgres;

--
-- Name: credit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.credit (
    id text NOT NULL,
    user_id text NOT NULL,
    user_email text,
    order_no text,
    subscription_no text,
    transaction_no text NOT NULL,
    transaction_type text NOT NULL,
    transaction_scene text,
    credits integer NOT NULL,
    remaining_credits integer DEFAULT 0 NOT NULL,
    description text,
    expires_at timestamp without time zone,
    status text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    deleted_at timestamp without time zone,
    consumed_detail text,
    metadata text
);


ALTER TABLE public.credit OWNER TO postgres;

--
-- Name: feedback; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feedback (
    id text NOT NULL,
    user_id text,
    content text,
    rating integer,
    status text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.feedback OWNER TO postgres;

--
-- Name: order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."order" (
    id text NOT NULL,
    order_no text NOT NULL,
    user_id text NOT NULL,
    user_email text,
    status text NOT NULL,
    amount integer NOT NULL,
    currency text NOT NULL,
    product_id text,
    payment_type text,
    payment_interval text,
    payment_provider text NOT NULL,
    payment_session_id text,
    checkout_info text NOT NULL,
    checkout_result text,
    payment_result text,
    discount_code text,
    discount_amount integer,
    discount_currency text,
    payment_email text,
    payment_amount integer,
    payment_currency text,
    paid_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    deleted_at timestamp without time zone,
    description text,
    product_name text,
    subscription_id text,
    subscription_result text,
    checkout_url text,
    callback_url text,
    credits_amount integer,
    credits_valid_days integer,
    plan_name text,
    payment_product_id text,
    invoice_id text,
    invoice_url text,
    subscription_no text,
    transaction_id text,
    payment_user_name text,
    payment_user_id text
);


ALTER TABLE public."order" OWNER TO postgres;

--
-- Name: permission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permission (
    id text NOT NULL,
    code text NOT NULL,
    resource text NOT NULL,
    action text NOT NULL,
    title text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.permission OWNER TO postgres;

--
-- Name: post; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post (
    id text NOT NULL,
    user_id text NOT NULL,
    parent_id text,
    slug text NOT NULL,
    type text NOT NULL,
    title text,
    description text,
    image text,
    content text,
    categories text,
    tags text,
    author_name text,
    author_image text,
    status text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    deleted_at timestamp without time zone,
    sort integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.post OWNER TO postgres;

--
-- Name: prompt; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prompt (
    id text NOT NULL,
    user_id text NOT NULL,
    title text NOT NULL,
    description text,
    image text,
    prompt_title text NOT NULL,
    prompt_description text,
    status text DEFAULT 'published'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    sort integer DEFAULT 0 NOT NULL,
    type text DEFAULT 'image'::text NOT NULL,
    model text
);


ALTER TABLE public.prompt OWNER TO postgres;

--
-- Name: referral; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.referral (
    id text NOT NULL,
    referrer_id text NOT NULL,
    referee_id text NOT NULL,
    order_no text,
    reward_credits integer DEFAULT 0,
    status text DEFAULT 'pending'::text NOT NULL,
    rewarded_at timestamp without time zone,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.referral OWNER TO postgres;

--
-- Name: role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role (
    id text NOT NULL,
    name text NOT NULL,
    title text NOT NULL,
    description text,
    status text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    sort integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.role OWNER TO postgres;

--
-- Name: role_permission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permission (
    id text NOT NULL,
    role_id text NOT NULL,
    permission_id text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.role_permission OWNER TO postgres;

--
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    id text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    token text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    ip_address text,
    user_agent text,
    user_id text NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- Name: showcase; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.showcase (
    id text NOT NULL,
    user_id text NOT NULL,
    title text NOT NULL,
    prompt text,
    image text NOT NULL,
    video_url text,
    tags text,
    description text,
    type text DEFAULT 'image'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    show_in_gallery integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.showcase OWNER TO postgres;

--
-- Name: subscription; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription (
    id text NOT NULL,
    subscription_no text NOT NULL,
    user_id text NOT NULL,
    user_email text,
    status text NOT NULL,
    payment_provider text NOT NULL,
    subscription_id text NOT NULL,
    subscription_result text,
    product_id text,
    description text,
    amount integer,
    currency text,
    "interval" text,
    interval_count integer,
    trial_period_days integer,
    current_period_start timestamp without time zone,
    current_period_end timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    deleted_at timestamp without time zone,
    plan_name text,
    billing_url text,
    product_name text,
    credits_amount integer,
    credits_valid_days integer,
    payment_product_id text,
    payment_user_id text,
    canceled_at timestamp without time zone,
    canceled_end_at timestamp without time zone,
    canceled_reason text,
    canceled_reason_type text
);


ALTER TABLE public.subscription OWNER TO postgres;

--
-- Name: taxonomy; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.taxonomy (
    id text NOT NULL,
    user_id text NOT NULL,
    parent_id text,
    slug text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    description text,
    image text,
    icon text,
    status text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    deleted_at timestamp without time zone,
    sort integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.taxonomy OWNER TO postgres;

--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    image text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    utm_source text DEFAULT ''::text NOT NULL,
    ip text DEFAULT ''::text NOT NULL,
    locale text DEFAULT ''::text NOT NULL
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: user_role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_role (
    id text NOT NULL,
    user_id text NOT NULL,
    role_id text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    expires_at timestamp without time zone
);


ALTER TABLE public.user_role OWNER TO postgres;

--
-- Name: verification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.verification (
    id text NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.verification OWNER TO postgres;

--
-- Name: video; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.video (
    id text NOT NULL,
    user_id text NOT NULL,
    prompt text NOT NULL,
    model text NOT NULL,
    parameters text NOT NULL,
    status text DEFAULT 'generating'::text NOT NULL,
    original_video_url text,
    video_url text,
    start_image_url text,
    first_frame_image_url text,
    file_size integer,
    duration text,
    resolution text,
    replicate_prediction_id text,
    generation_time integer,
    credits_used integer DEFAULT 0 NOT NULL,
    is_deleted integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    completed_at timestamp without time zone,
    show_in_gallery integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.video OWNER TO postgres;

--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: postgres
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	33754f43cfd0a2d3cf914b01dca2fad8c576485d5423a4f2a77d5af0265b4387	1775653620508
\.


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account (id, account_id, provider_id, user_id, access_token, refresh_token, id_token, access_token_expires_at, refresh_token_expires_at, scope, password, created_at, updated_at) FROM stdin;
168f995c-41e6-4a2e-83c7-8c4316d0945d	81961172-f752-46da-ab93-5712cf1ac879	credential	81961172-f752-46da-ab93-5712cf1ac879	\N	\N	\N	\N	\N	\N	d617badcb43d1cf82ed5d7bf7094d852:4a333be9052a30b1c89f90a3cbdd747ea8a5be3e577f970dacbc243fc96518c7db922c376802341e6f84f34dfced3a9cac49bdc3186669692c31b9d65b13ff26	2026-04-08 13:08:15.894	2026-04-08 13:08:15.894
\.


--
-- Data for Name: ai_task; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_task (id, user_id, media_type, provider, model, prompt, options, status, created_at, updated_at, deleted_at, task_id, task_info, task_result, cost_credits, scene, credit_id, show_in_gallery) FROM stdin;
f521c8eb-2b70-4119-90a3-8c55b42d372f	81961172-f752-46da-ab93-5712cf1ac879	image	kie	nano-banana-2	Create a realistic digital caricature painting of firgure 1 with a slightly oversized head, exuding charm and quiet confidence. He is dressed in space x. Underneath, he wears a warm-toned flannel shirt slightly visible at the collar and cuffs, paired with khaki cargo pants and black sneakersthat ground the outfit with a casual yet confident energy. Completing his look, he wears a brown flat cap tilted slightly forward — a small detail that adds personality and flair.The man is portrayed in a mid - shot,adjusting his glasses with one handwhile gazing directly at the viewer with a self - assured and composed expression.His head is slightly larger than normal,emphasizing his thoughtful character and giving the image a light caricature charm without losing realism.The facial expression radiates intelligence,humor,and approachability.The lighting is warm and soft,like that of a late afternoon sun filtering through a studio setup.Smooth gradual shadows enhance the contours of his face,while subtle highlights accentuate the texture of his bomber jacket and the reflection in his glasses.His skin tones glow naturally under the warm light,creating a pleasant sense of depth and realism.The background is a gradient of warm brown and beige hues,blending smoothly from light to dark.This background is simple yet elegant,allowing the subject to stand out while maintaining a professional,editorial quality.The art style should combine semi - realistic digital painting with the texture of oil brushstrokes,delivering a balanced fusion of realism and stylized charm.Clean outlines,smooth blending,and controlled highlights give the impression of a modern portrait illustration— detailed,expressive,and visually captivating.	{"aspect_ratio":"1:1","resolution":"1K","output_format":"png","source":"admin","promptId":"da8f25d1-d7ca-42c8-be41-97fe7fafc786"}	success	2026-04-17 12:07:15.180904	2026-04-17 04:13:36.708	\N	5d57f1c9920d9408219917ede8adbb9e	{"images":[{"id":"","createTime":"2026-04-17T04:07:12.382Z","imageUrl":"https://tempfile.aiquickdraw.com/images/1776398926632-ucgf3w6735i.png"}],"status":"success","errorCode":null,"errorMessage":null,"createTime":"2026-04-17T04:07:12.382Z"}	{"taskId":"5d57f1c9920d9408219917ede8adbb9e","model":"nano-banana-2","state":"success","param":"{\\"input\\":\\"{\\\\\\"aspect_ratio\\\\\\":\\\\\\"1:1\\\\\\",\\\\\\"output_format\\\\\\":\\\\\\"png\\\\\\",\\\\\\"prompt\\\\\\":\\\\\\"Create a realistic digital caricature painting of firgure 1 with a slightly oversized head, exuding charm and quiet confidence. He is dressed in space x. Underneath, he wears a warm-toned flannel shirt slightly visible at the collar and cuffs, paired with khaki cargo pants and black sneakersthat ground the outfit with a casual yet confident energy. Completing his look, he wears a brown flat cap tilted slightly forward — a small detail that adds personality and flair.The man is portrayed in a mid - shot,adjusting his glasses with one handwhile gazing directly at the viewer with a self - assured and composed expression.His head is slightly larger than normal,emphasizing his thoughtful character and giving the image a light caricature charm without losing realism.The facial expression radiates intelligence,humor,and approachability.The lighting is warm and soft,like that of a late afternoon sun filtering through a studio setup.Smooth gradual shadows enhance the contours of his face,while subtle highlights accentuate the texture of his bomber jacket and the reflection in his glasses.His skin tones glow naturally under the warm light,creating a pleasant sense of depth and realism.The background is a gradient of warm brown and beige hues,blending smoothly from light to dark.This background is simple yet elegant,allowing the subject to stand out while maintaining a professional,editorial quality.The art style should combine semi - realistic digital painting with the texture of oil brushstrokes,delivering a balanced fusion of realism and stylized charm.Clean outlines,smooth blending,and controlled highlights give the impression of a modern portrait illustration— detailed,expressive,and visually captivating.\\\\\\",\\\\\\"resolution\\\\\\":\\\\\\"1K\\\\\\"}\\",\\"callBackUrl\\":\\"http://localhost:3000/api/ai/notify/kie\\",\\"model\\":\\"nano-banana-2\\"}","resultJson":"{\\"resultUrls\\":[\\"https://tempfile.aiquickdraw.com/images/1776398926632-ucgf3w6735i.png\\"]}","failCode":null,"failMsg":null,"costTime":93,"completeTime":1776398927151,"createTime":1776398832382}	0	text-to-image	\N	0
c9d25b0b-01e5-4119-b040-596cd9876c4e	81961172-f752-46da-ab93-5712cf1ac879	image	kie	nano-banana-2	Dressed like the GTA: Vice City main character, leaning against a retro 1980s sports car  Ocean Drive.	{"aspect_ratio":"1:1","resolution":"1K","output_format":"png","source":"admin","promptId":"e9cc7fea-683b-49d0-9338-3c160f590f16"}	success	2026-04-17 13:16:44.183102	2026-04-17 05:17:36.61	\N	81cc0c84201821cf1e7b63974af8120a	{"images":[{"id":"","createTime":"2026-04-17T05:16:41.152Z","imageUrl":"https://cdn.aivideogeneratorfree.org/uploads/kie/image/57e2c769-bb7b-4bc2-9593-7e01f939540a.png"}],"status":"success","errorCode":null,"errorMessage":null,"createTime":"2026-04-17T05:16:41.152Z"}	{"taskId":"81cc0c84201821cf1e7b63974af8120a","model":"nano-banana-2","state":"success","param":"{\\"input\\":\\"{\\\\\\"aspect_ratio\\\\\\":\\\\\\"1:1\\\\\\",\\\\\\"output_format\\\\\\":\\\\\\"png\\\\\\",\\\\\\"prompt\\\\\\":\\\\\\"Dressed like the GTA: Vice City main character, leaning against a retro 1980s sports car  Ocean Drive.\\\\\\",\\\\\\"resolution\\\\\\":\\\\\\"1K\\\\\\"}\\",\\"callBackUrl\\":\\"http://localhost:3000/api/ai/notify/kie\\",\\"model\\":\\"nano-banana-2\\"}","resultJson":"{\\"resultUrls\\":[\\"https://tempfile.aiquickdraw.com/images/1776403032834-rnokj93xbcd.png\\"]}","failCode":null,"failMsg":null,"costTime":31,"completeTime":1776403033372,"createTime":1776403001152}	0	text-to-image	\N	0
\.


--
-- Data for Name: apikey; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.apikey (id, user_id, key, title, status, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: chat; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat (id, user_id, status, created_at, updated_at, model, provider, title, parts, metadata, content) FROM stdin;
\.


--
-- Data for Name: chat_message; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_message (id, user_id, chat_id, status, created_at, updated_at, role, parts, metadata, model, provider) FROM stdin;
\.


--
-- Data for Name: checkin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.checkin (id, user_id, checkin_date, streak, credits_granted, created_at) FROM stdin;
2a6830f2-d511-42f0-847b-36b21721671d	81961172-f752-46da-ab93-5712cf1ac879	2026-04-14	1	1	2026-04-14 15:56:41.558929
6b1f29e4-31d2-4f11-b7f5-7c184f52f549	81961172-f752-46da-ab93-5712cf1ac879	2026-04-16	1	1	2026-04-16 14:29:23.50269
\.


--
-- Data for Name: config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.config (name, value) FROM stdin;
r2_access_key	7eb2cd5590bbd4e3c7785136f33763cf
r2_secret_key	d67a9f9bb45f0c5966971153cc96b3f915644f3a88221352052348e60a6d4f95
r2_bucket_name	aivideogeneratorfree
r2_upload_path	
r2_endpoint	https://0ade9253738b9002668ac942e1ac4861.r2.cloudflarestorage.com
r2_domain	https://cdn.aivideogeneratorfree.org
kie_api_key	d332447bde5cf063366b3c2aed7eb3bc
kie_custom_storage	true
initial_credits_enabled	true
initial_credits_amount	10
initial_credits_valid_days	
initial_credits_description	
checkin_enabled	true
checkin_week1_credits	1
checkin_week2_credits	2
checkin_week3_credits	3
checkin_max_credits	200
checkin_credits_valid_days	0
referral_enabled	true
referral_reward_rate	0.2
referral_max_credits	2000
referral_reward_days	30
\.


--
-- Data for Name: credit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credit (id, user_id, user_email, order_no, subscription_no, transaction_no, transaction_type, transaction_scene, credits, remaining_credits, description, expires_at, status, created_at, updated_at, deleted_at, consumed_detail, metadata) FROM stdin;
8e6a2cc1-8d89-466a-a409-b300cb98f029	81961172-f752-46da-ab93-5712cf1ac879	66982889@qq.com			81230480000314190	grant	gift	1	1	Daily check-in (day 1)	\N	active	2026-04-14 15:56:41.566242	2026-04-14 07:56:41.562	\N	\N	\N
23a84814-d8cc-426d-977f-7bcba26d5aa1	81961172-f752-46da-ab93-5712cf1ac879	66982889@qq.com			81299113380557301	grant	gift	1	1	Daily check-in (day 1)	\N	active	2026-04-16 14:29:23.51579	2026-04-16 06:29:23.514	\N	\N	\N
\.


--
-- Data for Name: feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feedback (id, user_id, content, rating, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."order" (id, order_no, user_id, user_email, status, amount, currency, product_id, payment_type, payment_interval, payment_provider, payment_session_id, checkout_info, checkout_result, payment_result, discount_code, discount_amount, discount_currency, payment_email, payment_amount, payment_currency, paid_at, created_at, updated_at, deleted_at, description, product_name, subscription_id, subscription_result, checkout_url, callback_url, credits_amount, credits_valid_days, plan_name, payment_product_id, invoice_id, invoice_url, subscription_no, transaction_id, payment_user_name, payment_user_id) FROM stdin;
\.


--
-- Data for Name: permission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permission (id, code, resource, action, title, description, created_at, updated_at) FROM stdin;
4f7a33cd-8480-4103-ad6d-21cd53249c47	admin.access	admin	access	Admin Access	Access to admin area	2026-04-08 21:07:24.062099	2026-04-08 13:07:24.061
b00499c6-7324-4217-883d-02a6528572f4	admin.users.read	users	read	Read Users	View user list and details	2026-04-08 21:07:24.067379	2026-04-08 13:07:24.066
dd83a8ee-6eaa-450f-84e1-3cbb1008ea31	admin.users.write	users	write	Write Users	Create and update users	2026-04-08 21:07:24.069813	2026-04-08 13:07:24.069
1b0ee589-7e0c-4a5a-a124-756cd2bbf797	admin.users.delete	users	delete	Delete Users	Delete users	2026-04-08 21:07:24.071988	2026-04-08 13:07:24.071
311725ba-8f49-4f42-8a3c-bbd5f53fea04	admin.posts.read	posts	read	Read Posts	View post list and details	2026-04-08 21:07:24.074195	2026-04-08 13:07:24.073
a911c171-a2c5-48fd-9c03-48e5cc1d3c1b	admin.posts.write	posts	write	Write Posts	Create and update posts	2026-04-08 21:07:24.077236	2026-04-08 13:07:24.076
59af7549-5a4b-4b57-9c1e-6d269a9886e3	admin.posts.delete	posts	delete	Delete Posts	Delete posts	2026-04-08 21:07:24.078953	2026-04-08 13:07:24.078
663aa95b-5801-4dcd-b62e-de2693719afd	admin.categories.read	categories	read	Read Categories	View category list and details	2026-04-08 21:07:24.081315	2026-04-08 13:07:24.08
119372a4-295f-4dd2-b57f-ea7f0fbeb8b2	admin.categories.write	categories	write	Write Categories	Create and update categories	2026-04-08 21:07:24.083453	2026-04-08 13:07:24.082
5bfda4bf-bd4f-4bcb-b10a-54883f84bb57	admin.categories.delete	categories	delete	Delete Categories	Delete categories	2026-04-08 21:07:24.085004	2026-04-08 13:07:24.084
8434bf70-a375-4b44-a6c9-65aa4192d3ba	admin.payments.read	payments	read	Read Payments	View payment list and details	2026-04-08 21:07:24.086424	2026-04-08 13:07:24.085
1898c58d-e543-4456-81f8-3189a1b7098f	admin.subscriptions.read	subscriptions	read	Read Subscriptions	View subscription list and details	2026-04-08 21:07:24.087825	2026-04-08 13:07:24.087
44c701d6-69a6-416e-83e5-21137ec7fe03	admin.credits.read	credits	read	Read Credits	View credit list and details	2026-04-08 21:07:24.089289	2026-04-08 13:07:24.088
ddd017d6-02b9-4bbc-a3d1-6d3787277fab	admin.credits.write	credits	write	Write Credits	Grant or consume credits	2026-04-08 21:07:24.090898	2026-04-08 13:07:24.09
d3a28b13-964d-4b8e-893c-3afb3f704105	admin.apikeys.read	apikeys	read	Read API Keys	View API key list and details	2026-04-08 21:07:24.092254	2026-04-08 13:07:24.091
4d842d92-dd8f-4042-b78d-013ba8a8cd60	admin.apikeys.write	apikeys	write	Write API Keys	Create and update API keys	2026-04-08 21:07:24.093451	2026-04-08 13:07:24.092
c0867424-0371-4c83-af10-a439dd45768a	admin.apikeys.delete	apikeys	delete	Delete API Keys	Delete API keys	2026-04-08 21:07:24.094573	2026-04-08 13:07:24.093
78cf0182-448f-475a-afa8-2c16c98d44dc	admin.settings.read	settings	read	Read Settings	View system settings	2026-04-08 21:07:24.096431	2026-04-08 13:07:24.095
d82019d6-815f-4f23-9e77-083e71fce9a6	admin.settings.write	settings	write	Write Settings	Update system settings	2026-04-08 21:07:24.097631	2026-04-08 13:07:24.097
1182901c-88db-4c50-89e5-23e54f03c885	admin.roles.read	roles	read	Read Roles	View roles and permissions	2026-04-08 21:07:24.099028	2026-04-08 13:07:24.098
e30f563b-c72e-4f1d-a7be-dd218adaf1d0	admin.roles.write	roles	write	Write Roles	Create and update roles	2026-04-08 21:07:24.100449	2026-04-08 13:07:24.099
0e4cbe32-788b-4014-bb23-0787256e27a3	admin.roles.delete	roles	delete	Delete Roles	Delete roles	2026-04-08 21:07:24.101976	2026-04-08 13:07:24.101
6b629835-4f94-432d-a491-c8f0ed9bb130	admin.permissions.read	permissions	read	Read Permissions	View permission list and details	2026-04-08 21:07:24.103232	2026-04-08 13:07:24.102
7a49f39d-8d88-461f-9f69-ae0ba37b6a1c	admin.permissions.write	permissions	write	Write Permissions	Create and update permissions	2026-04-08 21:07:24.104658	2026-04-08 13:07:24.104
762c3c44-3cd4-4dd9-9fbf-59f6243776ac	admin.permissions.delete	permissions	delete	Delete Permissions	Delete permissions	2026-04-08 21:07:24.106723	2026-04-08 13:07:24.106
c4f578e0-6e57-42cf-ae06-6fa262339410	admin.ai-tasks.read	ai-tasks	read	Read AI Tasks	View AI task list and details	2026-04-08 21:07:24.108389	2026-04-08 13:07:24.107
64ea6b8a-84b6-4531-8730-fa71acbe4e39	admin.ai-tasks.write	ai-tasks	write	Write AI Tasks	Create and update AI tasks	2026-04-08 21:07:24.10986	2026-04-08 13:07:24.109
79376ef9-d6a7-4752-ab10-b97ae8a1e3ab	admin.ai-tasks.delete	ai-tasks	delete	Delete AI Tasks	Delete AI tasks	2026-04-08 21:07:24.111365	2026-04-08 13:07:24.11
389b9c18-b825-4a8c-b82b-46802e59df72	*	all	all	Super Admin	All permissions (super admin only)	2026-04-08 21:07:24.112612	2026-04-08 13:07:24.112
\.


--
-- Data for Name: post; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post (id, user_id, parent_id, slug, type, title, description, image, content, categories, tags, author_name, author_image, status, created_at, updated_at, deleted_at, sort) FROM stdin;
70c3044d-6923-46d8-96ca-0035ced573df	81961172-f752-46da-ab93-5712cf1ac879	\N	how-to-create-ai-videos-for-free	article	How to Create AI Videos for Free	Discover 3 ways to get free credits on AI Video Generator Free — sign-up bonus, daily check-in, and referral rewards. Start creating stunning AI videos without spending a dime.	\N	Creating AI videos used to cost money. Not anymore. AI Video Generator Free gives you multiple ways to earn credits — the currency that powers every video you generate — completely free. Here's a breakdown of all three.\n\n## What Are Credits?\n\nCredits are the in-platform currency used to generate AI videos. Every time you create a video, a small number of credits is deducted based on the model, resolution, and duration you choose. The good news: you don't need to buy credits to get started.\n\n---\n\n## Way 1: Sign-Up Bonus — Instant Free Credits\n\nThe moment you create a free account, credits land in your wallet automatically. No credit card. No trial period. No strings attached.\n\n**How it works:**\n1. Go to AI Video Generator Free and click **[Sign Up](/sign-up)**\n2. Create your account with Google or email\n3. Credits are added to your account instantly\n4. Head to the AI Video Generator and start creating\n\nThis is the fastest way to get started. Most users generate their first AI video within minutes of signing up.\n\n---\n\n## Way 2: Daily Check-In — Earn Credits Every Day\n\nLog in and check in daily to build a streak and earn more credits over time. The longer your streak, the more you earn per day.\n\n**Reward schedule:**\n\n| Streak | Credits per Day |\n|--------|----------------|\n| Day 1–7 | +1 credit/day |\n| Day 8–14 | +2 credits/day |\n| Day 15+ | +3 credits/day |\n\n**Rules:**\n- Check in once per day from your [Activity dashboard](/activity/checkin)\n- Missing a day resets your streak back to Day 1\n- Maximum of 200 credits earned through check-ins total\n\n**Tips to maximize check-in credits:**\n- Set a daily reminder — it only takes one click\n- Aim for a 15-day streak to unlock the highest daily reward\n- Even if you're not generating videos that day, check in to keep your streak alive\n\n---\n\n## Way 3: Refer a Friend — Earn Up to 2,000 Credits\n\nThis is the highest-value way to earn free credits. When someone you refer makes their first purchase, you automatically receive **20% of their paid credits** — up to 2,000 credits per referral.\n\n**How it works:**\n1. Go to your [Check-in & Referral page](/activity/checkin)\n2. Copy your unique referral link\n3. Share it with friends, on social media, or in your content\n4. When your friend signs up through your link and makes a purchase, your reward is credited within 30 days\n\n**Example:**\n> Your friend buys a 500-credit pack → You earn 100 credits automatically\n\n**Why this matters:**\nIf you're a content creator, YouTuber, or anyone with an audience, the referral program can keep your credit balance topped up indefinitely — just by sharing a link you'd recommend anyway.\n\n---\n\n## Summary: 3 Ways to Get Free Credits\n\n| Method | Credits | When |\n|--------|---------|------|\n| Sign-Up Bonus | Free credits on registration | Instant |\n| Daily Check-In | Up to 200 credits total | Daily |\n| Refer a Friend | Up to 2,000 credits per referral | Within 30 days of friend's purchase |\n\n---\n\n## Start Creating AI Videos for Free\n\nYou now have everything you need to generate AI videos without spending anything. Sign up, check in daily, and share your referral link — your credit balance will grow while you create.\n\nReady to start? Head to the [AI Video Generator](/ai-video-generator) and generate your first video free.\n\n- [Sign Up Free →](/sign-up)\n- [Daily Check-In →](/activity/checkin)\n- [Referral & Rewards →](/activity/checkin)	85656484-dd1d-4aad-bab7-f5b8f7acba81	\N	Admin	/logo.svg	published	2026-04-14 15:13:55.102108	2026-04-15 08:32:44.468	\N	0
\.


--
-- Data for Name: prompt; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prompt (id, user_id, title, description, image, prompt_title, prompt_description, status, created_at, updated_at, sort, type, model) FROM stdin;
0785124c-3991-4be2-b88b-0570dc7e155d	81961172-f752-46da-ab93-5712cf1ac879	Vertical fisheye selfie	A vertical fisheye selfie taken on September 16th, featuring the person in the photo posing with [Doraemon, Naruto, Nobita, Gojou Satoru, and Narumi (Ash from Pokémon)].	https://cdn.aivideogeneratorfree.org/uploads/1765110039128-w4jh04.jpg	vertical-fisheye-selfie	A vertical fisheye selfie taken on September 16th, featuring the person in the photo posing with [Doraemon, Naruto, Nobita, Gojou Satoru, and Narumi (Ash from Pokémon)].	published	2025-12-07 12:20:51.703942	2025-12-07 12:20:48.037	0	image	\N
4a7d174a-bdea-4c7a-a226-acc8eabc717f	81961172-f752-46da-ab93-5712cf1ac879	Selfie with Nick Wilde	Photorealistic 8K: the person from the uploaded photo stands side-by-side with Nick Wilde (Zootopia fox in his green shirt and tie, sly smile) in a dimly lit, crowded cinema; they pose together for a selfie, large movie screen behind them showing action scenes, cinematic lighting. The person is a woman with long black hair, white strapless top with black stars, silver necklace, smiling.	https://cdn.aivideogeneratorfree.org/uploads/1765109823629-uewppu.jpg	selfie-with-nick-wilde	Photorealistic 8K: the person from the uploaded photo stands side-by-side with Nick Wilde (Zootopia fox in his green shirt and tie, sly smile) in a dimly lit, crowded cinema; they pose together for a selfie, large movie screen behind them showing action scenes, cinematic lighting. The person is a woman with long black hair, white strapless top with black stars, silver necklace, smiling.	published	2025-12-07 12:17:25.267816	2025-12-07 12:17:21.621	0	image	\N
575d0c54-435e-43b3-8aed-196bdfe47a2a	81961172-f752-46da-ab93-5712cf1ac879	Hairstyles	Make a 3x3 grid with different hairstyles.	https://cdn.aivideogeneratorfree.org/uploads/1765109772054-67ne86.jpg	hairstyles	Make a 3x3 grid with different hairstyles.	published	2025-12-07 12:16:29.383568	2025-12-07 12:16:25.736	0	image	\N
65c508ce-d534-4268-b7ac-3f6185aca1cc	81961172-f752-46da-ab93-5712cf1ac879	3D caricature of celebrity	A highly stylized 3D caricature of [celebrity], with an oversized head, expressive facial features, and playful exaggeration. Rendered in a smooth, polished style with clean materials and soft ambient lighting. Minimal background to emphasize the character’s charm and presence.	https://cdn.aivideogeneratorfree.org/uploads/1765109883045-a7fezv.jpg	3d-caricature-of-celebrity	A highly stylized 3D caricature of [celebrity], with an oversized head, expressive facial features, and playful exaggeration. Rendered in a smooth, polished style with clean materials and soft ambient lighting. Minimal background to emphasize the character’s charm and presence.	published	2025-12-07 12:18:22.963804	2025-12-07 12:18:19.302	0	image	\N
6785725f-774c-4aac-abe0-6864b2b516b3	81961172-f752-46da-ab93-5712cf1ac879	Photo restoration	Faithfully restore this image with high fidelity to modern photograph quality, in full color, upscale to 4K	https://cdn.aivideogeneratorfree.org/uploads/1765109931772-ck8k2i.jpg	photo-restoration	Faithfully restore this image with high fidelity to modern photograph quality, in full color, upscale to 4K	published	2025-12-07 12:19:12.287266	2025-12-07 12:19:08.648	0	image	\N
86e980e3-a16d-441f-8691-ed7d3371f9a9	81961172-f752-46da-ab93-5712cf1ac879	Zootopia characters selfie	Photorealistic 8K: the person from the uploaded photo stands side-by-side with Judy Hopps (Zootopia rabbit officer in police uniform, smiling) in a dimly lit, crowded cinema; they pose together for a selfie, large movie screen behind them showing action scenes, cinematic lighting.	https://cdn.aivideogeneratorfree.org/uploads/1765109680903-47phjm.jpg	zootopia-characters-selfie	Photorealistic 8K: the person from the uploaded photo stands side-by-side with Judy Hopps (Zootopia rabbit officer in police uniform, smiling) in a dimly lit, crowded cinema; they pose together for a selfie, large movie screen behind them showing action scenes, cinematic lighting.	published	2025-12-07 12:14:57.722433	2025-12-07 12:14:54.087	0	image	\N
bc6356f4-8225-4f85-b63a-c723e77b6f22	81961172-f752-46da-ab93-5712cf1ac879	3D City Weather	Present a clear, 45° top-down isometric miniature 3D cartoon scene of [CITY], featuring its most iconic landmarks and architectural elements. Use soft, refined textures with realistic PBR materials and gentle, lifelike lighting and shadows. Integrate the current weather conditions directly into the city environment to create an immersive atmospheric mood.Use a clean, minimalistic composition with a soft, solid-colored background.At the top-center, place the title “[CITY]” in large bold text, a prominent weather icon beneath it, then the date (small text) and temperature (medium text).All text must be centered with consistent spacing, and may subtly overlap the tops of the buildings.Square 1080x1080 dimension.	https://cdn.aivideogeneratorfree.org/uploads/1765109592336-x6eugs.jpg	toy-story-thanksgiving-dinner	Woody, Buzz, Jessie, and Rex having Thanksgiving dinner on the McCallister dining table. The house decorated exactly like Home Alone. Tiny toy-sized turkey. Kevin peeks from the stairs. Warm yellow Christmas lights, nostalgic 90s mood. A 4K photo of the scene.	published	2025-12-07 11:51:48.552034	2025-12-07 12:13:18.646	0	image	\N
da8f25d1-d7ca-42c8-be41-97fe7fafc786	81961172-f752-46da-ab93-5712cf1ac879	3D Digital Human Comics	Create a realistic digital caricature painting of firgure 1 with a slightly oversized head, exuding charm and quiet confidence. He is dressed in space x. Underneath, he wears a warm-toned flannel shirt slightly visible at the collar and cuffs, paired with khaki cargo pants and black sneakersthat ground the outfit with a casual yet confident energy. Completing his look, he wears a brown flat cap tilted slightly forward — a small detail that adds personality and flair.The man is portrayed in a mid - shot,adjusting his glasses with one handwhile gazing directly at the viewer with a self - assured and composed expression.His head is slightly larger than normal,emphasizing his thoughtful character and giving the image a light caricature charm without losing realism.The facial expression radiates intelligence,humor,and approachability.The lighting is warm and soft,like that of a late afternoon sun filtering through a studio setup.Smooth gradual shadows enhance the contours of his face,while subtle highlights accentuate the texture of his bomber jacket and the reflection in his glasses.His skin tones glow naturally under the warm light,creating a pleasant sense of depth and realism.The background is a gradient of warm brown and beige hues,blending smoothly from light to dark.This background is simple yet elegant,allowing the subject to stand out while maintaining a professional,editorial quality.The art style should combine semi - realistic digital painting with the texture of oil brushstrokes,delivering a balanced fusion of realism and stylized charm.Clean outlines,smooth blending,and controlled highlights give the impression of a modern portrait illustration— detailed,expressive,and visually captivating.	https://cdn.aivideogeneratorfree.org/uploads/1765110083462-9xgwxl.jpg	3d-digital-human-comics	Create a realistic digital caricature painting of firgure 1 with a slightly oversized head, exuding charm and quiet confidence. He is dressed in space x. Underneath, he wears a warm-toned flannel shirt slightly visible at the collar and cuffs, paired with khaki cargo pants and black sneakersthat ground the outfit with a casual yet confident energy. Completing his look, he wears a brown flat cap tilted slightly forward — a small detail that adds personality and flair.The man is portrayed in a mid - shot,adjusting his glasses with one handwhile gazing directly at the viewer with a self - assured and composed expression.His head is slightly larger than normal,emphasizing his thoughtful character and giving the image a light caricature charm without losing realism.The facial expression radiates intelligence,humor,and approachability.The lighting is warm and soft,like that of a late afternoon sun filtering through a studio setup.Smooth gradual shadows enhance the contours of his face,while subtle highlights accentuate the texture of his bomber jacket and the reflection in his glasses.His skin tones glow naturally under the warm light,creating a pleasant sense of depth and realism.The background is a gradient of warm brown and beige hues,blending smoothly from light to dark.This background is simple yet elegant,allowing the subject to stand out while maintaining a professional,editorial quality.The art style should combine semi - realistic digital painting with the texture of oil brushstrokes,delivering a balanced fusion of realism and stylized charm.Clean outlines,smooth blending,and controlled highlights give the impression of a modern portrait illustration— detailed,expressive,and visually captivating.	published	2025-12-07 12:22:01.216178	2025-12-07 12:21:57.563	0	image	\N
e9cc7fea-683b-49d0-9338-3c160f590f16	81961172-f752-46da-ab93-5712cf1ac879	GTA VICE CITY	Dressed like the GTA: Vice City main character, leaning against a retro 1980s sports car Ocean Drive.	https://cdn.aivideogeneratorfree.org/uploads/1765109727191-qvx34s.jpg	gta-vice-city	Dressed like the GTA: Vice City main character, leaning against a retro 1980s sports car  Ocean Drive.	published	2025-12-07 12:15:43.936457	2025-12-07 12:15:40.297	0	image	\N
\.


--
-- Data for Name: referral; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.referral (id, referrer_id, referee_id, order_no, reward_credits, status, rewarded_at, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role (id, name, title, description, status, created_at, updated_at, sort) FROM stdin;
42065d6a-b487-417a-a74b-7af1c415bfc6	super_admin	Super Admin	Full system access with all permissions	active	2026-04-08 21:07:24.115677	2026-04-08 13:07:24.115	1
bbab0dc1-04cb-4d4a-8dc5-3ff3e0c72963	admin	Admin	Administrator with most permissions	active	2026-04-08 21:07:24.121856	2026-04-08 13:07:24.121	2
e508d956-8653-4899-ac37-55166dbf4cb4	editor	Editor	Content editor with limited permissions	active	2026-04-08 21:07:24.139727	2026-04-08 13:07:24.139	3
69df63e2-b96c-4d6b-8b3b-4baad92bc7c0	viewer	Viewer	Read-only access to admin area	active	2026-04-08 21:07:24.144885	2026-04-08 13:07:24.144	4
\.


--
-- Data for Name: role_permission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permission (id, role_id, permission_id, created_at, updated_at, deleted_at) FROM stdin;
05dbaa9f-7fe4-473a-a5dd-ae1536d1f948	42065d6a-b487-417a-a74b-7af1c415bfc6	389b9c18-b825-4a8c-b82b-46802e59df72	2026-04-08 21:07:24.119365	2026-04-08 13:07:24.118	\N
3ed0a17a-3aff-4396-94da-8d5864e084af	bbab0dc1-04cb-4d4a-8dc5-3ff3e0c72963	4f7a33cd-8480-4103-ad6d-21cd53249c47	2026-04-08 21:07:24.123294	2026-04-08 13:07:24.122	\N
dd9fbce1-1139-4fa5-aa20-910aedce67e8	bbab0dc1-04cb-4d4a-8dc5-3ff3e0c72963	b00499c6-7324-4217-883d-02a6528572f4	2026-04-08 21:07:24.123971	2026-04-08 13:07:24.123	\N
2fbdac35-b698-4402-8f18-b3b99c259856	bbab0dc1-04cb-4d4a-8dc5-3ff3e0c72963	dd83a8ee-6eaa-450f-84e1-3cbb1008ea31	2026-04-08 21:07:24.124523	2026-04-08 13:07:24.124	\N
37ca2e1a-d1e4-4ba9-9c67-31d65bb80e79	bbab0dc1-04cb-4d4a-8dc5-3ff3e0c72963	1b0ee589-7e0c-4a5a-a124-756cd2bbf797	2026-04-08 21:07:24.125181	2026-04-08 13:07:24.124	\N
398e759a-a6c2-4d5f-89f4-ecdd5a6b774f	bbab0dc1-04cb-4d4a-8dc5-3ff3e0c72963	311725ba-8f49-4f42-8a3c-bbd5f53fea04	2026-04-08 21:07:24.126008	2026-04-08 13:07:24.125	\N
88680033-fda1-4e08-a255-c8a64113f3e9	bbab0dc1-04cb-4d4a-8dc5-3ff3e0c72963	a911c171-a2c5-48fd-9c03-48e5cc1d3c1b	2026-04-08 21:07:24.126569	2026-04-08 13:07:24.126	\N
49f01e5e-c872-4efb-bce9-63b3ee913898	bbab0dc1-04cb-4d4a-8dc5-3ff3e0c72963	59af7549-5a4b-4b57-9c1e-6d269a9886e3	2026-04-08 21:07:24.127073	2026-04-08 13:07:24.126	\N
30ba1ec3-6ee6-4a33-a776-5920dd7aac6d	bbab0dc1-04cb-4d4a-8dc5-3ff3e0c72963	663aa95b-5801-4dcd-b62e-de2693719afd	2026-04-08 21:07:24.127863	2026-04-08 13:07:24.127	\N
c66fc715-ea4d-4342-9bae-b75e65d49aa9	bbab0dc1-04cb-4d4a-8dc5-3ff3e0c72963	119372a4-295f-4dd2-b57f-ea7f0fbeb8b2	2026-04-08 21:07:24.12851	2026-04-08 13:07:24.128	\N
f41f838d-3878-44fd-b53d-45286a84e52b	bbab0dc1-04cb-4d4a-8dc5-3ff3e0c72963	5bfda4bf-bd4f-4bcb-b10a-54883f84bb57	2026-04-08 21:07:24.129312	2026-04-08 13:07:24.128	\N
2ea64049-658b-4a45-be0f-62c6eb72c372	bbab0dc1-04cb-4d4a-8dc5-3ff3e0c72963	8434bf70-a375-4b44-a6c9-65aa4192d3ba	2026-04-08 21:07:24.130217	2026-04-08 13:07:24.129	\N
6113d135-c823-4d11-b707-91b72656e762	bbab0dc1-04cb-4d4a-8dc5-3ff3e0c72963	1898c58d-e543-4456-81f8-3189a1b7098f	2026-04-08 21:07:24.130968	2026-04-08 13:07:24.13	\N
64d56c41-9b14-4090-8223-d36858e637f5	bbab0dc1-04cb-4d4a-8dc5-3ff3e0c72963	44c701d6-69a6-416e-83e5-21137ec7fe03	2026-04-08 21:07:24.131827	2026-04-08 13:07:24.131	\N
18fb2464-28a0-4393-850d-524399b966b2	bbab0dc1-04cb-4d4a-8dc5-3ff3e0c72963	ddd017d6-02b9-4bbc-a3d1-6d3787277fab	2026-04-08 21:07:24.132677	2026-04-08 13:07:24.132	\N
8aa8791e-9abb-43da-b99d-d0107a83e6d0	bbab0dc1-04cb-4d4a-8dc5-3ff3e0c72963	d3a28b13-964d-4b8e-893c-3afb3f704105	2026-04-08 21:07:24.133509	2026-04-08 13:07:24.132	\N
85164f09-e142-42a0-8daa-f6c5826f8fd5	bbab0dc1-04cb-4d4a-8dc5-3ff3e0c72963	4d842d92-dd8f-4042-b78d-013ba8a8cd60	2026-04-08 21:07:24.134365	2026-04-08 13:07:24.133	\N
bbecf59b-b51a-45d3-9453-ccfe2ccab9ab	bbab0dc1-04cb-4d4a-8dc5-3ff3e0c72963	c0867424-0371-4c83-af10-a439dd45768a	2026-04-08 21:07:24.135394	2026-04-08 13:07:24.134	\N
095c6dd6-d187-4b3e-9646-b1e017ce5d1e	bbab0dc1-04cb-4d4a-8dc5-3ff3e0c72963	78cf0182-448f-475a-afa8-2c16c98d44dc	2026-04-08 21:07:24.135998	2026-04-08 13:07:24.135	\N
d5293737-c927-48b2-bac1-291bcedefa31	bbab0dc1-04cb-4d4a-8dc5-3ff3e0c72963	c4f578e0-6e57-42cf-ae06-6fa262339410	2026-04-08 21:07:24.136525	2026-04-08 13:07:24.136	\N
7a1852ca-1cc5-4e96-a9e5-05060353726a	bbab0dc1-04cb-4d4a-8dc5-3ff3e0c72963	64ea6b8a-84b6-4531-8730-fa71acbe4e39	2026-04-08 21:07:24.13701	2026-04-08 13:07:24.136	\N
042217ce-ee5d-41fb-99f9-77a33591be3a	bbab0dc1-04cb-4d4a-8dc5-3ff3e0c72963	79376ef9-d6a7-4752-ab10-b97ae8a1e3ab	2026-04-08 21:07:24.137897	2026-04-08 13:07:24.137	\N
01f830f6-e454-4044-b263-f567363157b5	e508d956-8653-4899-ac37-55166dbf4cb4	4f7a33cd-8480-4103-ad6d-21cd53249c47	2026-04-08 21:07:24.141168	2026-04-08 13:07:24.14	\N
945544d9-9bf7-470a-b6f2-72c9d1bd6d50	e508d956-8653-4899-ac37-55166dbf4cb4	311725ba-8f49-4f42-8a3c-bbd5f53fea04	2026-04-08 21:07:24.141882	2026-04-08 13:07:24.141	\N
3ac17f5c-24ab-4bdf-b5db-96c39f747041	e508d956-8653-4899-ac37-55166dbf4cb4	a911c171-a2c5-48fd-9c03-48e5cc1d3c1b	2026-04-08 21:07:24.142391	2026-04-08 13:07:24.141	\N
5f96e2e4-7f7f-487a-bfad-1cee30718f9e	e508d956-8653-4899-ac37-55166dbf4cb4	663aa95b-5801-4dcd-b62e-de2693719afd	2026-04-08 21:07:24.142884	2026-04-08 13:07:24.142	\N
6b23934a-ed76-4e47-ae96-8e61d29a9a9d	e508d956-8653-4899-ac37-55166dbf4cb4	119372a4-295f-4dd2-b57f-ea7f0fbeb8b2	2026-04-08 21:07:24.143361	2026-04-08 13:07:24.142	\N
a3ad9634-1bec-42f7-9f6b-ea057d5d0d5d	69df63e2-b96c-4d6b-8b3b-4baad92bc7c0	4f7a33cd-8480-4103-ad6d-21cd53249c47	2026-04-08 21:07:24.14614	2026-04-08 13:07:24.145	\N
0b9c8447-7b16-4cf5-89a2-ca7e8a1fd343	69df63e2-b96c-4d6b-8b3b-4baad92bc7c0	b00499c6-7324-4217-883d-02a6528572f4	2026-04-08 21:07:24.146865	2026-04-08 13:07:24.146	\N
953cb0c7-3576-4f95-a58f-9ab9db474228	69df63e2-b96c-4d6b-8b3b-4baad92bc7c0	311725ba-8f49-4f42-8a3c-bbd5f53fea04	2026-04-08 21:07:24.147657	2026-04-08 13:07:24.147	\N
599d161b-5f49-4ff4-b811-2b7b42f44f09	69df63e2-b96c-4d6b-8b3b-4baad92bc7c0	663aa95b-5801-4dcd-b62e-de2693719afd	2026-04-08 21:07:24.148325	2026-04-08 13:07:24.147	\N
682470c9-25b3-484f-bb3c-18dd58add414	69df63e2-b96c-4d6b-8b3b-4baad92bc7c0	8434bf70-a375-4b44-a6c9-65aa4192d3ba	2026-04-08 21:07:24.148959	2026-04-08 13:07:24.148	\N
c212a442-d92f-432a-8b2a-3a83e4d74273	69df63e2-b96c-4d6b-8b3b-4baad92bc7c0	1898c58d-e543-4456-81f8-3189a1b7098f	2026-04-08 21:07:24.14966	2026-04-08 13:07:24.149	\N
e8ebade3-1624-4228-9a91-ab1f9d7a70d1	69df63e2-b96c-4d6b-8b3b-4baad92bc7c0	44c701d6-69a6-416e-83e5-21137ec7fe03	2026-04-08 21:07:24.150282	2026-04-08 13:07:24.149	\N
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (id, expires_at, token, created_at, updated_at, ip_address, user_agent, user_id) FROM stdin;
d01080c7-d8f6-4867-b7dd-479a1de582e6	2026-04-22 08:03:57.611	7XkUqKVd8yqpvOA61p7eiqIqZPIO8SR9	2026-04-08 13:08:15.901	2026-04-15 08:03:57.611		Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36	81961172-f752-46da-ab93-5712cf1ac879
742590f8-56ea-48cf-bb22-06897234d3e2	2026-04-26 07:42:22.695	NfsmI38VROVRNWmw8hn75AQv2ukBlx9Q	2026-04-17 02:31:35.61	2026-04-19 07:42:22.695		Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36	81961172-f752-46da-ab93-5712cf1ac879
\.


--
-- Data for Name: showcase; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.showcase (id, user_id, title, prompt, image, video_url, tags, description, type, created_at, show_in_gallery) FROM stdin;
035ecac2-a0c5-46c9-bce7-d8e39e3f9dab	81961172-f752-46da-ab93-5712cf1ac879	Women Hairstyle 1	\N	https://cdn.aivideogeneratorfree.org/uploads/1765158854257-xpfm2e.jpg	\N	hairstyles,women	women hairstyle	image	2025-12-08 01:54:30.648625	0
15080b53-3ba7-4dd6-b1bf-c0a412489b4e	81961172-f752-46da-ab93-5712cf1ac879	Dramatic silhouette picture	A powerful, high-contrast black-and-white side-profile portrait of a person (use reference photo, Keep face of person 100% accurate from the reference image), with distinctly human yet timeless features emerging from complete darkness.	https://cdn.aivideogeneratorfree.org/uploads/1765200028507-igz0d6.jpg	\N	\N	\N	image	2025-12-08 13:20:39.808464	0
1f47db88-0776-44d9-8b17-3b1ec49a6c7c	81961172-f752-46da-ab93-5712cf1ac879	Men Hairstyle 4	\N	https://cdn.aivideogeneratorfree.org/uploads/1765165121977-8gpc5y.jpg	\N	hairstyles,men	men hairstyle	image	2025-12-08 03:38:59.315512	0
22f15299-be2a-446e-b887-659c168ed933	81961172-f752-46da-ab93-5712cf1ac879	Model photography	Canon camera, 85mm fixed lens, creating a gradual change of f/1.8, f/2.8, f/10, f/14 aperture effects, a gentle and beautiful lady as the model, background is the city blue hour after sunset	https://cdn.aivideogeneratorfree.org/uploads/1765200728030-ddyrhy.jpg	\N	\N	\N	image	2025-12-08 13:32:17.348416	0
2416f557-fc0a-43eb-8026-7b183fb2dea7	81961172-f752-46da-ab93-5712cf1ac879	A highly stylized 3D caricature of [celebrity], with an oversized head, expressive facial features,	A highly stylized 3D caricature of [celebrity], with an oversized head, expressive facial features, and playful exaggeration. Rendered in a smooth, polished style with clean materials and soft ambient lighting. Minimal background to emphasize the character’s charm and presence.	https://cdn.aivideogeneratorfree.org/uploads/1765214947606-7w5lrt.jpg	\N	3d-caricature-of-celebrity	\N	image	2025-12-08 17:29:16.527308	0
2aa7bebf-de0b-4c73-8f53-c1bca7afbf22	81961172-f752-46da-ab93-5712cf1ac879	Celebrity Group Photo	A group photo of celebrities, with a focus on character consistency and scene preservation.	https://cdn.aivideogeneratorfree.org/uploads/1765173019660-rcp595.jpg	\N	\N	\N	image	2025-12-08 05:50:32.302528	0
42885bc2-9270-4083-85ce-b24422bfdeba	81961172-f752-46da-ab93-5712cf1ac879	Anime photo generation	9/16 vertical format fisheye selfie of an ultra-realistic woman from a photo with [Doraemon, Naruto, Nobita, Satoru Gojo, Sung Jin, who is Ash from Pokémon].	https://cdn.aivideogeneratorfree.org/uploads/1765199973038-pi3jt9.jpg	\N	\N	\N	image	2025-12-08 13:19:41.333169	0
453b71c4-2eca-4468-91ae-24f33fa66d99	81961172-f752-46da-ab93-5712cf1ac879	Animal Hairstyle 2	\N	https://cdn.aivideogeneratorfree.org/uploads/1765164525067-qdvw7k.jpg	\N	hairstyles,animal	animal hairstyle	image	2025-12-08 03:28:57.972612	0
55e49107-5569-4275-823a-889778deb677	81961172-f752-46da-ab93-5712cf1ac879	Men Hairstyle 2	\N	https://cdn.aivideogeneratorfree.org/uploads/1765165027036-horjyg.jpg	\N	hairstyles,men	men hairstyle	image	2025-12-08 03:37:19.28363	0
5ab0f5cb-c9ed-4e58-b6cf-ec86625ecb61	81961172-f752-46da-ab93-5712cf1ac879	Character consistency	Nano Banana Pro swaps characters instantly: no masking, no blending. Experience the power of Nano Banana image editing.	https://cdn.aivideogeneratorfree.org/uploads/1765199913331-luxwrh.jpg	\N	\N	\N	image	2025-12-08 13:18:47.651543	0
6102bb99-866a-4cf3-9fa1-2a8f63ab22d1	81961172-f752-46da-ab93-5712cf1ac879	GTA VICE CITY	Dressed like the GTA: Vice City main character, leaning against a retro 1980s sports car Ocean Drive.	https://cdn.aivideogeneratorfree.org/uploads/1765199754670-9ldx0i.jpg	\N	\N	\N	image	2025-12-08 13:16:04.980194	0
7e494771-4853-4dfb-bf58-26441ae7ce8e	81961172-f752-46da-ab93-5712cf1ac879	Learning Cards	Turn any content you want to learn into study cards.	https://cdn.aivideogeneratorfree.org/uploads/1765200614252-f25tlu.jpg	\N	\N	\N	image	2025-12-08 13:30:27.808154	0
95cd1451-930e-492d-91a5-4aca206106e1	81961172-f752-46da-ab93-5712cf1ac879	Photorealistic 8K: the person from the uploaded photo stands side-by-side with Nick Wilde (Zootopia	Photorealistic 8K: the person from the uploaded photo stands side-by-side with Nick Wilde (Zootopia fox in his green shirt and tie, sly smile) in a dimly lit, crowded cinema; they pose together for a selfie, large movie screen behind them showing action scenes, cinematic lighting. The person is a woman with long black hair, white strapless top with black stars, silver necklace, smiling.	https://cdn.aivideogeneratorfree.org/uploads/1765213747914-fubw2p.jpg	\N	selfie-with-nick-wilde	\N	image	2025-12-08 17:09:15.386649	0
9ab126fd-4d0b-41dc-8784-8875af3534e0	81961172-f752-46da-ab93-5712cf1ac879	Complex infographics	Nano Banana Pro delivers SOTA image generation and editing with advanced world knowledge, text rendering, precision and controls. It's really good at complex infographics - much like how engineers see the world.	https://cdn.aivideogeneratorfree.org/uploads/1765199698448-eskxpg.jpg	\N	\N	\N	image	2025-12-08 13:15:11.642561	0
a1f884a2-edcc-438e-a013-c1dbeb360d73	81961172-f752-46da-ab93-5712cf1ac879	Women Hairstyle 2	\N	https://cdn.aivideogeneratorfree.org/uploads/1765164857497-3vribu.jpg	\N	hairstyles,women	women hairstyle	image	2025-12-08 03:34:31.908702	0
a43719cb-12ff-4585-9228-b3c2c3945d11	81961172-f752-46da-ab93-5712cf1ac879	Sketch drawing	Realistic cliff rescue, use man photo as hero, woman photo as one slipping, match sketch side pose and composition precisely, mountain photo (style reference) for background.	https://cdn.aivideogeneratorfree.org/uploads/1765199638303-nsmsyd.jpg	\N	\N	\N	image	2025-12-08 13:14:13.79871	0
abd18110-674c-4cca-8dc4-3cfa140bb597	81961172-f752-46da-ab93-5712cf1ac879	A highly stylized 3D caricature of [celebrity], with an oversized head, expressive facial features,	A highly stylized 3D caricature of [celebrity], with an oversized head, expressive facial features, and playful exaggeration. Rendered in a smooth, polished style with clean materials and soft ambient lighting. Minimal background to emphasize the character’s charm and presence.	https://cdn.aivideogeneratorfree.org/uploads/1765215470859-wuqc1m.jpg	\N	3d-caricature-of-celebrity	\N	image	2025-12-08 17:37:57.168296	0
b465070d-f485-455c-bbfb-4c2ed4227c34	81961172-f752-46da-ab93-5712cf1ac879	Specified poses	Convert the required actions to 3D dolls in bulk using SAM 3D.	https://cdn.aivideogeneratorfree.org/uploads/1765200670632-k5srhn.jpg	\N	\N	\N	image	2025-12-08 13:31:18.623058	0
b52a373e-d7d7-439e-be96-79cb56c8a545	81961172-f752-46da-ab93-5712cf1ac879	Poster generation	A modern and stylish graphic design poster for a Christmas Sale, with a vibrant, playful energy.	https://cdn.aivideogeneratorfree.org/uploads/1765199316095-7u8or4.jpg	\N	\N	\N	image	2025-12-08 13:10:03.051678	0
b7d33302-332e-49be-999a-ad09c871b71d	81961172-f752-46da-ab93-5712cf1ac879	Men Hairstyle 3	\N	https://cdn.aivideogeneratorfree.org/uploads/1765165076111-5pucfw.jpg	\N	hairstyles,men	men hairstyle	image	2025-12-08 03:38:07.55006	0
b9a8417f-ad64-49f5-ab41-0f7c17a41743	81961172-f752-46da-ab93-5712cf1ac879	PARISIAN SHADOW ICON WITH PIGEONS	8k hyper realistic,A cinematic portrait of a man uploaded picture in the reference image ( Keep face of person 100% accurate from the reference image.)	https://cdn.aivideogeneratorfree.org/uploads/1765199467947-b5n600.jpg	\N	\N	\N	image	2025-12-08 13:11:18.982206	0
bf023e98-adf3-401a-9bca-2c3584b55a41	81961172-f752-46da-ab93-5712cf1ac879	Animal Hairstyle 1	\N	https://cdn.aivideogeneratorfree.org/uploads/1765164420858-ryuumb.jpg	\N	hairstyles,animal	animal hairstyle	image	2025-12-08 03:27:25.660557	0
d25cff31-1eae-4b73-ae8c-d8bf23c2eec0	81961172-f752-46da-ab93-5712cf1ac879	Idol group photos	Generate leaked photo BTS from KPOP Demon Hunters live action movie set	https://cdn.aivideogeneratorfree.org/uploads/1765199587168-g3yi3k.jpg	\N	\N	\N	image	2025-12-08 13:13:17.423337	0
e13ef304-dab2-4cc0-b120-070fdc30fdee	81961172-f752-46da-ab93-5712cf1ac879	Brand Fashion	Create a grid of 4 editorial fashion images focused on [Nike], [2 x macro, 2 x dynamic action] that follow the same style and colour palette as [@]img1. Make each of the new shots unique.	https://cdn.aivideogeneratorfree.org/uploads/1765200082640-fmjl02.jpg	\N	\N	\N	image	2025-12-08 13:28:53.652502	0
eb98faf8-1954-43b3-8d80-ba51c6d5965b	81961172-f752-46da-ab93-5712cf1ac879	Japanese anime style	Generate a Japanese anime style image of Cardcaptor Sakura	https://cdn.aivideogeneratorfree.org/uploads/1765190413009-j4uepk.jpg	\N	\N	\N	image	2025-12-08 10:40:25.096468	0
f471609d-0020-4b67-9541-f2e359bb7cb7	81961172-f752-46da-ab93-5712cf1ac879	Photo of magazine article	Put this whole text, verbatim, into a photo of a glossy magazine article on a desk, with photos, beautiful typography design, pull quotes and brave formatting. The text: [...the unformatted article]	https://cdn.aivideogeneratorfree.org/uploads/1765199845935-8w9lzw.jpg	\N	\N	\N	image	2025-12-08 13:17:43.911543	0
ff06b9a3-4ae0-4e85-b902-fcff46e69a15	81961172-f752-46da-ab93-5712cf1ac879	Men Hairstyle 1	\N	https://cdn.aivideogeneratorfree.org/uploads/1765164975254-3485kl.jpg	\N	hairstyles,men	men hairstyle	image	2025-12-08 03:36:26.299046	0
8d540700-6d8d-466b-bc37-a4b9693181e7	81961172-f752-46da-ab93-5712cf1ac879	Wan 2.7 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/wan/1776133167201_m5y0zo.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/wan/1776133167201_m5y0zo.mp4	wan	Wan 2.7 AI Video Example 6	video	2026-04-10 14:09:39.49341	0
46420ae1-4f75-4034-bdf2-833bee1c3cf2	81961172-f752-46da-ab93-5712cf1ac879	A golden retriever dashing through shallow surf at the beach, back ...	A golden retriever dashing through shallow surf at the beach, back angle camera low near waterline, splashes frozen in time, blur trails in waves and paws, afternoon sun glinting off wet fur, overcast	https://cdn.aivideogeneratorfree.org/uploads/model-videos/seedance/1776132894486_kbi12g.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/seedance/1776132894486_kbi12g.mp4	seedance	Seedance 2.0 AI Video Example 9	video	2026-04-10 14:09:39.483083	0
75fed188-316c-48bf-9d65-fa3f7c20ebc8	81961172-f752-46da-ab93-5712cf1ac879	Seedance 2.0 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/seedance/1776132907211_e3xb0a.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/seedance/1776132907211_e3xb0a.mp4	seedance	Seedance 2.0 AI Video Example 8	video	2026-04-10 14:09:39.48141	0
173e25b5-d7fd-4ef9-a061-195132aea1ba	81961172-f752-46da-ab93-5712cf1ac879	Seedance 2.0 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/seedance/1776132978252_zn1yqj.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/seedance/1776132978252_zn1yqj.mp4	seedance	Seedance 2.0 AI Video Example 7	video	2026-04-10 14:09:39.479569	0
ecf305e3-2e03-4238-a8d9-43d465f29f7a	81961172-f752-46da-ab93-5712cf1ac879	Seedance 2.0 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/seedance/1776133078141_sy7ils.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/seedance/1776133078141_sy7ils.mp4	seedance	Seedance 2.0 AI Video Example 6	video	2026-04-10 14:09:39.478217	0
5394ce3c-6be5-4580-b303-7c47bc49aaab	81961172-f752-46da-ab93-5712cf1ac879	Seedance 2.0 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/seedance/1776133129486_84pnwt.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/seedance/1776133129486_84pnwt.mp4	seedance	Seedance 2.0 AI Video Example 4	video	2026-04-10 14:09:39.473353	0
838d318b-197b-44d1-85c2-78c6c8d87f85	81961172-f752-46da-ab93-5712cf1ac879	Seedance 2.0 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/seedance/1776133133380_nfls6p.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/seedance/1776133133380_nfls6p.mp4	seedance	Seedance 2.0 AI Video Example 3	video	2026-04-10 14:09:39.471711	0
2e66ea03-ff4f-4bc0-a8db-261a5e2386ce	81961172-f752-46da-ab93-5712cf1ac879	Kling 3.0 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/kling/1776132653136_vvpwhc.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/kling/1776132653136_vvpwhc.mp4	kling	Kling 3.0 AI Video Example 8	video	2026-04-10 14:09:39.510227	0
869e9210-f065-405a-9173-8c5b1fb1e44b	81961172-f752-46da-ab93-5712cf1ac879	A flower blooming and wilting over two weeks, one photo per day. Sa...	A flower blooming and wilting over two weeks, one photo per day. Same vase, same window, same angle. Light changes with weather. Audio: Quiet domestic.The positive prompt for the generation	https://cdn.aivideogeneratorfree.org/uploads/model-videos/wan/1776133157512_r2jy3p.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/wan/1776133157512_r2jy3p.mp4	wan	Wan 2.7 AI Video Example 9	video	2026-04-10 14:09:39.497304	0
de855198-ec7d-493e-82a6-17fc0175690c	81961172-f752-46da-ab93-5712cf1ac879	Grok Imagine — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/grok-imagine/1776132584314_3w6gfh.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/grok-imagine/1776132584314_3w6gfh.mp4	grok-imagine	\N	video	2026-04-14 10:54:57.034536	0
ef6f3fff-5cdc-4910-8adf-69d44b1a0d22	81961172-f752-46da-ab93-5712cf1ac879	Cinematic portrait of a woman sitting by a vinyl record player, ret...	Cinematic portrait of a woman sitting by a vinyl record player, retro living room background, soft ambient lighting, warm earthy tones, nostalgic 1970s wardrobe, reflective mood, gentle film grain tex	https://cdn.aivideogeneratorfree.org/uploads/model-videos/grok-imagine/1776132885839_7vmxu0.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/grok-imagine/1776132885839_7vmxu0.mp4	grok-imagine	\N	video	2026-04-14 10:54:57.029774	0
48513113-c21e-4175-921c-5ce1dacd1bf2	81961172-f752-46da-ab93-5712cf1ac879	AI Video Generator Free — Grok Imagine	\N	https://static.aiquickdraw.com/tools/example/1775029498799_9HJRSiTP.mp4#t=0.5	https://static.aiquickdraw.com/tools/example/1775029498799_9HJRSiTP.mp4	grok	Grok Imagine AI Video Example 3	video	2026-04-10 14:09:39.533744	0
15c29535-d6ff-4934-aff6-6bc309724ee4	81961172-f752-46da-ab93-5712cf1ac879	Grok Imagine — Cinematic AI Video	prompt:string*aspect_ratio:string (2:3 | 3:2 | 1:1 | 9:16 | 16:9)enable_pro:boolean	https://file.aiquickdraw.com/custom-page/akr/section-images/1762248271431um2rtrv9.mp4#t=0.5	https://file.aiquickdraw.com/custom-page/akr/section-images/1762248271431um2rtrv9.mp4	grok	prompt:string*aspect_ratio:string (2:3 | 3:2 | 1:1 | 9:16 | 16:9)enable_pro:boolean	video	2026-04-10 14:09:39.532569	0
6a03648d-4082-4da9-a62e-af891febc0eb	81961172-f752-46da-ab93-5712cf1ac879	Cinematic portrait of a woman sitting by a vinyl record player, ret...	Cinematic portrait of a woman sitting by a vinyl record player, retro living room background, soft ambient lighting, warm earthy tones, nostalgic 1970s wardrobe, reflective mood, gentle film grain tex	https://file.aiquickdraw.com/custom-page/akr/section-images/1762247832657qdblcxkp.mp4#t=0.5	https://file.aiquickdraw.com/custom-page/akr/section-images/1762247832657qdblcxkp.mp4	grok	Cinematic portrait of a woman sitting by a vinyl record player, retro living room background, soft ambient lighting, warm earthy tones, nostalgic 1970s wardrobe, reflective mood, gentle film grain tex	video	2026-04-10 14:09:39.530397	0
8f213d22-861d-4d65-ab23-4a0569fa8238	81961172-f752-46da-ab93-5712cf1ac879	Kling 3.0 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/kling/1776132738107_x8avbz.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/kling/1776132738107_x8avbz.mp4	kling	738 / 2500 charactersduration*@Elements	video	2026-04-10 14:09:39.503502	0
7679b51d-5207-4c24-aa28-ef8bb2c54bc4	81961172-f752-46da-ab93-5712cf1ac879	Kling 3.0 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/kling/1776132747082_0k25ub.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/kling/1776132747082_0k25ub.mp4	kling	738 / 2500 charactersduration*@Elements	video	2026-04-10 14:09:39.502432	0
e6f24ecd-11d9-49cd-b5cb-ebb26464fdac	81961172-f752-46da-ab93-5712cf1ac879	Kling 3.0 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/kling/1776132757143_y7cxxo.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/kling/1776132757143_y7cxxo.mp4	kling	738 / 2500 charactersduration*@Elements	video	2026-04-10 14:09:39.500898	0
bab4a15c-a6c0-41ba-b2e8-3aefb623c562	81961172-f752-46da-ab93-5712cf1ac879	Kling 3.0 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/kling/1776132767194_eetqp8.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/kling/1776132767194_eetqp8.mp4	kling	738 / 2500 charactersduration*@Elements	video	2026-04-10 14:09:39.499274	0
9666d4bb-71bf-406b-8102-cc6e1bb26c8f	81961172-f752-46da-ab93-5712cf1ac879	Wan 2.7 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/wan/1776133190632_2mlmhl.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/wan/1776133190632_2mlmhl.mp4	wan	Wan 2.7 AI Video Example 5	video	2026-04-10 14:09:39.492072	0
c19ddc88-bed0-4fff-9474-e3723a430059	81961172-f752-46da-ab93-5712cf1ac879	Wan 2.7 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/wan/1776133214716_evp09u.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/wan/1776133214716_evp09u.mp4	wan	Wan 2.7 AI Video Example 4	video	2026-04-10 14:09:39.490276	0
61c51a97-3b00-4fff-9ef1-e5fcf1cf94cb	81961172-f752-46da-ab93-5712cf1ac879	Sora 2 Pro — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/sora/1776132937064_ahs7id.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/sora/1776132937064_ahs7id.mp4	sora	Sora 2 Pro AI Video Example 8	video	2026-04-10 14:09:39.525793	0
a944e7a1-bda4-481b-8634-4b59b6fd825a	81961172-f752-46da-ab93-5712cf1ac879	Sora 2 Pro — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/sora/1776132966164_xeoah6.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/sora/1776132966164_xeoah6.mp4	sora	Sora 2 Pro AI Video Example 5	video	2026-04-10 14:09:39.518693	0
efd1079b-dbf9-437a-a240-68c185a14b98	81961172-f752-46da-ab93-5712cf1ac879	Sora 2 Pro — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/sora/1776132979670_5tmiqn.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/sora/1776132979670_5tmiqn.mp4	sora	Sora 2 Pro AI Video Example 4	video	2026-04-10 14:09:39.517685	0
f9705f2a-50dc-4060-a609-aeb7133e54d7	81961172-f752-46da-ab93-5712cf1ac879	Sora 2 Pro — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/sora/1776133001463_wwhh14.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/sora/1776133001463_wwhh14.mp4	sora	Sora 2 Pro AI Video Example 3	video	2026-04-10 14:09:39.516501	0
f875dd31-10ac-453d-a192-a06a92633750	81961172-f752-46da-ab93-5712cf1ac879	Sora 2 Pro — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/sora/1776133040150_sp39wp.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/sora/1776133040150_sp39wp.mp4	sora	Sora 2 Pro AI Video Example 2	video	2026-04-10 14:09:39.514773	0
31008db5-066b-42e6-a78c-4a7e0491621a	81961172-f752-46da-ab93-5712cf1ac879	Kling 3.0 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/kling/1776132700496_qpmgyn.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/kling/1776132700496_qpmgyn.mp4	kling	Kling 3.0 AI Video Example 7	video	2026-04-10 14:09:39.509015	0
6b9fae1a-9f7e-4455-adf5-68f0f5f6e789	81961172-f752-46da-ab93-5712cf1ac879	Kling 3.0 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/kling/1776132726868_gokrhe.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/kling/1776132726868_gokrhe.mp4	kling	738 / 2500 charactersduration*@Elements	video	2026-04-10 14:09:39.504837	0
aa225cda-d6cb-4df9-ab45-d9cd152eb12e	81961172-f752-46da-ab93-5712cf1ac879	Seedance 2.0 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/seedance/1776133138623_82r0bs.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/seedance/1776133138623_82r0bs.mp4	seedance	Seedance 2.0 AI Video Example 2	video	2026-04-10 14:09:39.469888	0
46bfbce9-bfad-4467-9a09-4f2ae9f6ed12	81961172-f752-46da-ab93-5712cf1ac879	AI Video Generator Free — Sora 2 Pro	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/sora/1776132909680_7608is.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/sora/1776132909680_7608is.mp4	sora	Sora 2 Pro AI Video Example 9	video	2026-04-10 14:09:39.527429	0
a00caf13-c60b-408b-954e-ccf72846a49e	81961172-f752-46da-ab93-5712cf1ac879	Sora 2 Pro — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/sora/1776132949407_r5876p.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/sora/1776132949407_r5876p.mp4	sora	Sora 2 Pro AI Video Example 7	video	2026-04-10 14:09:39.523617	0
e4d2b5f9-f1f4-495e-be27-0ec83cdbd59a	81961172-f752-46da-ab93-5712cf1ac879	Sora 2 Pro — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/sora/1776132961350_cv3doi.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/sora/1776132961350_cv3doi.mp4	sora	Sora 2 Pro AI Video Example 6	video	2026-04-10 14:09:39.520308	0
f29a3133-a4bf-45a0-abde-cd1e8b45220f	81961172-f752-46da-ab93-5712cf1ac879	Kling 3.0 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/kling/1776132712649_s7wti7.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/kling/1776132712649_s7wti7.mp4	kling	prompt:string*image_urls:array*sound:boolean*duration:string (5 | 10)*	video	2026-04-10 14:09:39.50597	0
467eda73-a360-4188-87f5-2cd22e5cc528	81961172-f752-46da-ab93-5712cf1ac879	Wan 2.7 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/wan/1776133164507_ipok06.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/wan/1776133164507_ipok06.mp4	wan	Wan 2.7 AI Video Example 7	video	2026-04-10 14:09:39.494776	0
1a4a41da-af64-454e-9b70-86f68cbbb8e7	81961172-f752-46da-ab93-5712cf1ac879	Seedance 2.0 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/seedance/1776133147058_4mvnoj.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/seedance/1776133147058_4mvnoj.mp4	seedance	A golden retriever dashing through shallow surf at the beach, back angle camera low near waterline, splashes frozen in time, blur trails in waves and paws, afternoon sun glinting off wet fur, overcast	video	2026-04-10 14:09:39.453115	0
28a50301-61c1-4e4e-b12f-06e8fcb70555	81961172-f752-46da-ab93-5712cf1ac879	Hailuo 2.3 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/hailuo/1776132623661_23gjgz.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/hailuo/1776132623661_23gjgz.mp4	hailuo	Hailuo 2.3 AI Video Example 4	video	2026-04-10 14:09:39.538264	0
abff58de-befe-4edb-9677-38ec0c364005	81961172-f752-46da-ab93-5712cf1ac879	Hailuo 2.3 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/hailuo/1776132630272_law8ut.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/hailuo/1776132630272_law8ut.mp4	hailuo	Hailuo 2.3 AI Video Example 3	video	2026-04-10 14:09:39.537343	0
58678cc4-d6d8-41d2-b756-7ee0af1dcc8f	81961172-f752-46da-ab93-5712cf1ac879	Hailuo 2.3 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/hailuo/1776132632841_lyi13o.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/hailuo/1776132632841_lyi13o.mp4	hailuo	Hailuo 2.3 AI Video Example 2	video	2026-04-10 14:09:39.536431	0
67e69329-33ca-4d10-8c2e-382e2e4259ab	81961172-f752-46da-ab93-5712cf1ac879	Hailuo 2.3 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/hailuo/1776132638564_8b5uxk.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/hailuo/1776132638564_8b5uxk.mp4	hailuo	Hailuo 2.3 AI Video Example 1	video	2026-04-10 14:09:39.535466	0
bf148726-0ce2-44d3-90c6-b7a9dadb7771	81961172-f752-46da-ab93-5712cf1ac879	Sora 2 Pro — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/sora/1776133065136_dtnqwd.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/sora/1776133065136_dtnqwd.mp4	sora	Sora 2 Pro AI Video Example 1	video	2026-04-10 14:09:39.513218	0
3d92c2d6-5769-467e-9332-119fee16eb28	81961172-f752-46da-ab93-5712cf1ac879	Kling 3.0 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/kling/1776132641865_z6vki3.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/kling/1776132641865_z6vki3.mp4	kling	Kling 3.0 AI Video Example 9	video	2026-04-10 14:09:39.511499	0
b85b5e0d-bece-4b30-8f8d-28e7a6d31303	81961172-f752-46da-ab93-5712cf1ac879	Veo 3.1 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/veo/1776133111614_97ugy3.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/veo/1776133111614_97ugy3.mp4	veo	Veo 3.1 AI Video Example 2	video	2026-04-10 14:09:39.544476	0
56e12cc4-bae0-4ca6-bc46-d4ecd87ed7db	81961172-f752-46da-ab93-5712cf1ac879	AI Video Generator Free — Hailuo 2.3	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/hailuo/1776132602967_b2knnm.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/hailuo/1776132602967_b2knnm.mp4	hailuo	Hailuo 2.3 AI Video Example 6	video	2026-04-10 14:09:39.541196	0
9fd041c9-8774-47e4-9e38-a11e127b1500	81961172-f752-46da-ab93-5712cf1ac879	Hailuo 2.3 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/hailuo/1776132618772_sdmmgo.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/hailuo/1776132618772_sdmmgo.mp4	hailuo	Hailuo 2.3 AI Video Example 5	video	2026-04-10 14:09:39.53944	0
690c635a-f9de-4e97-9dda-c5c5c9f23e4d	81961172-f752-46da-ab93-5712cf1ac879	Veo 3.1 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/veo/1776133122942_p397us.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/veo/1776133122942_p397us.mp4	veo	Veo 3.1 AI Video Example 1	video	2026-04-10 14:09:39.543027	0
2abb0d97-bb23-4f37-958c-62bd9ee15d01	81961172-f752-46da-ab93-5712cf1ac879	Wan 2.7 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/wan/1776133161172_39gt3i.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/wan/1776133161172_39gt3i.mp4	wan	Wan 2.7 AI Video Example 8	video	2026-04-10 14:09:39.49619	0
25d6b30c-640f-49e8-a0db-0b2abf57e877	81961172-f752-46da-ab93-5712cf1ac879	Seedance 2.0 — Cinematic AI Video	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/seedance/1776133096750_sxcvkv.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/seedance/1776133096750_sxcvkv.mp4	seedance	Seedance 2.0 AI Video Example 5	video	2026-04-10 14:09:39.476126	0
8ca5b03d-d92c-43e1-b819-e5265163cc32	81961172-f752-46da-ab93-5712cf1ac879	AI Video Generator Free — Grok Imagine	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/grok-imagine/1776132597049_f0gclx.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/grok-imagine/1776132597049_f0gclx.mp4	grok-imagine	\N	video	2026-04-14 10:54:57.036511	0
bed680b6-0629-4b49-817b-0dcdf9f48e23	81961172-f752-46da-ab93-5712cf1ac879	AI Video Generator Free — Veo 3.1	\N	https://cdn.aivideogeneratorfree.org/uploads/model-videos/veo/1776133088983_90m4hf.mp4#t=0.5	https://cdn.aivideogeneratorfree.org/uploads/model-videos/veo/1776133088983_90m4hf.mp4	veo	Veo 3.1 AI Video Example 3	video	2026-04-10 14:09:39.545915	0
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription (id, subscription_no, user_id, user_email, status, payment_provider, subscription_id, subscription_result, product_id, description, amount, currency, "interval", interval_count, trial_period_days, current_period_start, current_period_end, created_at, updated_at, deleted_at, plan_name, billing_url, product_name, credits_amount, credits_valid_days, payment_product_id, payment_user_id, canceled_at, canceled_end_at, canceled_reason, canceled_reason_type) FROM stdin;
\.


--
-- Data for Name: taxonomy; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.taxonomy (id, user_id, parent_id, slug, type, title, description, image, icon, status, created_at, updated_at, deleted_at, sort) FROM stdin;
85656484-dd1d-4aad-bab7-f5b8f7acba81	81961172-f752-46da-ab93-5712cf1ac879	\N	activity	category	Activity	\N	\N	\N	published	2026-04-14 15:13:55.090186	2026-04-14 07:13:55.087	\N	0
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, name, email, email_verified, image, created_at, updated_at, utm_source, ip, locale) FROM stdin;
81961172-f752-46da-ab93-5712cf1ac879	Tony	66982889@qq.com	f	\N	2026-04-08 13:08:15.862	2026-04-08 13:08:15.862		::1	en
\.


--
-- Data for Name: user_role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_role (id, user_id, role_id, created_at, updated_at, expires_at) FROM stdin;
26770673-d35c-45fb-ab29-bfa875ea2472	81961172-f752-46da-ab93-5712cf1ac879	42065d6a-b487-417a-a74b-7af1c415bfc6	2026-04-08 21:08:55.870025	2026-04-08 13:08:55.868	\N
\.


--
-- Data for Name: verification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.verification (id, identifier, value, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: video; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.video (id, user_id, prompt, model, parameters, status, original_video_url, video_url, start_image_url, first_frame_image_url, file_size, duration, resolution, replicate_prediction_id, generation_time, credits_used, is_deleted, created_at, updated_at, completed_at, show_in_gallery) FROM stdin;
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: postgres
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 1, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: ai_task ai_task_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_task
    ADD CONSTRAINT ai_task_pkey PRIMARY KEY (id);


--
-- Name: apikey apikey_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.apikey
    ADD CONSTRAINT apikey_pkey PRIMARY KEY (id);


--
-- Name: chat_message chat_message_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_message
    ADD CONSTRAINT chat_message_pkey PRIMARY KEY (id);


--
-- Name: chat chat_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat
    ADD CONSTRAINT chat_pkey PRIMARY KEY (id);


--
-- Name: checkin checkin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkin
    ADD CONSTRAINT checkin_pkey PRIMARY KEY (id);


--
-- Name: config config_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.config
    ADD CONSTRAINT config_name_unique UNIQUE (name);


--
-- Name: credit credit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit
    ADD CONSTRAINT credit_pkey PRIMARY KEY (id);


--
-- Name: credit credit_transaction_no_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit
    ADD CONSTRAINT credit_transaction_no_unique UNIQUE (transaction_no);


--
-- Name: feedback feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (id);


--
-- Name: order order_order_no_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_order_no_unique UNIQUE (order_no);


--
-- Name: order order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_pkey PRIMARY KEY (id);


--
-- Name: permission permission_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission
    ADD CONSTRAINT permission_code_unique UNIQUE (code);


--
-- Name: permission permission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission
    ADD CONSTRAINT permission_pkey PRIMARY KEY (id);


--
-- Name: post post_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT post_pkey PRIMARY KEY (id);


--
-- Name: post post_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT post_slug_unique UNIQUE (slug);


--
-- Name: prompt prompt_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prompt
    ADD CONSTRAINT prompt_pkey PRIMARY KEY (id);


--
-- Name: referral referral_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.referral
    ADD CONSTRAINT referral_pkey PRIMARY KEY (id);


--
-- Name: role role_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_name_unique UNIQUE (name);


--
-- Name: role_permission role_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT role_permission_pkey PRIMARY KEY (id);


--
-- Name: role role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: session session_token_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_token_unique UNIQUE (token);


--
-- Name: showcase showcase_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.showcase
    ADD CONSTRAINT showcase_pkey PRIMARY KEY (id);


--
-- Name: subscription subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription
    ADD CONSTRAINT subscription_pkey PRIMARY KEY (id);


--
-- Name: subscription subscription_subscription_no_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription
    ADD CONSTRAINT subscription_subscription_no_unique UNIQUE (subscription_no);


--
-- Name: taxonomy taxonomy_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taxonomy
    ADD CONSTRAINT taxonomy_pkey PRIMARY KEY (id);


--
-- Name: taxonomy taxonomy_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taxonomy
    ADD CONSTRAINT taxonomy_slug_unique UNIQUE (slug);


--
-- Name: user user_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_unique UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: user_role user_role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_pkey PRIMARY KEY (id);


--
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- Name: video video_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.video
    ADD CONSTRAINT video_pkey PRIMARY KEY (id);


--
-- Name: idx_account_provider_account; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_account_provider_account ON public.account USING btree (provider_id, account_id);


--
-- Name: idx_account_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_account_user_id ON public.account USING btree (user_id);


--
-- Name: idx_ai_task_media_type_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_task_media_type_status ON public.ai_task USING btree (media_type, status);


--
-- Name: idx_ai_task_user_media_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_task_user_media_type ON public.ai_task USING btree (user_id, media_type);


--
-- Name: idx_apikey_key_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_apikey_key_status ON public.apikey USING btree (key, status);


--
-- Name: idx_apikey_user_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_apikey_user_status ON public.apikey USING btree (user_id, status);


--
-- Name: idx_chat_message_chat_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chat_message_chat_id ON public.chat_message USING btree (chat_id, status);


--
-- Name: idx_chat_message_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chat_message_user_id ON public.chat_message USING btree (user_id, status);


--
-- Name: idx_chat_user_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chat_user_status ON public.chat USING btree (user_id, status);


--
-- Name: idx_checkin_user_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_checkin_user_date ON public.checkin USING btree (user_id, checkin_date);


--
-- Name: idx_credit_consume_fifo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_credit_consume_fifo ON public.credit USING btree (user_id, status, transaction_type, remaining_credits, expires_at);


--
-- Name: idx_credit_order_no; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_credit_order_no ON public.credit USING btree (order_no);


--
-- Name: idx_credit_subscription_no; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_credit_subscription_no ON public.credit USING btree (subscription_no);


--
-- Name: idx_order_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_created_at ON public."order" USING btree (created_at);


--
-- Name: idx_order_transaction_provider; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_transaction_provider ON public."order" USING btree (transaction_id, payment_provider);


--
-- Name: idx_order_user_status_payment_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_user_status_payment_type ON public."order" USING btree (user_id, status, payment_type);


--
-- Name: idx_permission_resource_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_permission_resource_action ON public.permission USING btree (resource, action);


--
-- Name: idx_post_type_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_type_status ON public.post USING btree (type, status);


--
-- Name: idx_prompt_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prompt_created_at ON public.prompt USING btree (created_at);


--
-- Name: idx_prompt_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prompt_status ON public.prompt USING btree (status);


--
-- Name: idx_referral_referee; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_referral_referee ON public.referral USING btree (referee_id);


--
-- Name: idx_referral_referrer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_referral_referrer ON public.referral USING btree (referrer_id);


--
-- Name: idx_referral_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_referral_status ON public.referral USING btree (status);


--
-- Name: idx_role_permission_role_permission; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_role_permission_role_permission ON public.role_permission USING btree (role_id, permission_id);


--
-- Name: idx_role_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_role_status ON public.role USING btree (status);


--
-- Name: idx_session_user_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_session_user_expires ON public.session USING btree (user_id, expires_at);


--
-- Name: idx_showcase_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_showcase_created_at ON public.showcase USING btree (created_at);


--
-- Name: idx_showcase_tags; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_showcase_tags ON public.showcase USING btree (tags);


--
-- Name: idx_showcase_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_showcase_user_id ON public.showcase USING btree (user_id);


--
-- Name: idx_subscription_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscription_created_at ON public.subscription USING btree (created_at);


--
-- Name: idx_subscription_provider_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscription_provider_id ON public.subscription USING btree (subscription_id, payment_provider);


--
-- Name: idx_subscription_user_status_interval; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscription_user_status_interval ON public.subscription USING btree (user_id, status, "interval");


--
-- Name: idx_taxonomy_type_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_taxonomy_type_status ON public.taxonomy USING btree (type, status);


--
-- Name: idx_user_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_created_at ON public."user" USING btree (created_at);


--
-- Name: idx_user_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_name ON public."user" USING btree (name);


--
-- Name: idx_user_role_user_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_role_user_expires ON public.user_role USING btree (user_id, expires_at);


--
-- Name: idx_verification_identifier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_verification_identifier ON public.verification USING btree (identifier);


--
-- Name: idx_video_prediction_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_video_prediction_id ON public.video USING btree (replicate_prediction_id);


--
-- Name: idx_video_user_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_video_user_status ON public.video USING btree (user_id, status);


--
-- Name: account account_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: ai_task ai_task_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_task
    ADD CONSTRAINT ai_task_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: apikey apikey_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.apikey
    ADD CONSTRAINT apikey_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: chat_message chat_message_chat_id_chat_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_message
    ADD CONSTRAINT chat_message_chat_id_chat_id_fk FOREIGN KEY (chat_id) REFERENCES public.chat(id) ON DELETE CASCADE;


--
-- Name: chat_message chat_message_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_message
    ADD CONSTRAINT chat_message_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: chat chat_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat
    ADD CONSTRAINT chat_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: checkin checkin_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkin
    ADD CONSTRAINT checkin_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: credit credit_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit
    ADD CONSTRAINT credit_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: feedback feedback_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: order order_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: post post_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT post_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: prompt prompt_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prompt
    ADD CONSTRAINT prompt_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: referral referral_referee_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.referral
    ADD CONSTRAINT referral_referee_id_user_id_fk FOREIGN KEY (referee_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: referral referral_referrer_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.referral
    ADD CONSTRAINT referral_referrer_id_user_id_fk FOREIGN KEY (referrer_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: role_permission role_permission_permission_id_permission_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT role_permission_permission_id_permission_id_fk FOREIGN KEY (permission_id) REFERENCES public.permission(id) ON DELETE CASCADE;


--
-- Name: role_permission role_permission_role_id_role_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT role_permission_role_id_role_id_fk FOREIGN KEY (role_id) REFERENCES public.role(id) ON DELETE CASCADE;


--
-- Name: session session_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: showcase showcase_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.showcase
    ADD CONSTRAINT showcase_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: subscription subscription_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription
    ADD CONSTRAINT subscription_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: taxonomy taxonomy_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taxonomy
    ADD CONSTRAINT taxonomy_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: user_role user_role_role_id_role_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_role_id_role_id_fk FOREIGN KEY (role_id) REFERENCES public.role(id) ON DELETE CASCADE;


--
-- Name: user_role user_role_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: video video_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.video
    ADD CONSTRAINT video_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict FeLLjBct6XMKh9xxC2eRAb8rtNhQWXw7m4y2iHzTVe51WKbIvgYKPzv3enUw7fB

