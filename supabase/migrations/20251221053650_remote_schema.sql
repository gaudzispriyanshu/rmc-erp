drop extension if exists "pg_net";

create sequence "public"."customers_id_seq";

create sequence "public"."drivers_id_seq";

create sequence "public"."inventory_items_id_seq";

create sequence "public"."invoices_id_seq";

create sequence "public"."mix_designs_id_seq";

create sequence "public"."mix_requirements_id_seq";

create sequence "public"."orders_id_seq";

create sequence "public"."trip_updates_id_seq";

create sequence "public"."trips_id_seq";

create sequence "public"."users_id_seq";

create sequence "public"."vehicles_id_seq";


  create table "public"."customers" (
    "id" integer not null default nextval('public.customers_id_seq'::regclass),
    "name" character varying(100) not null,
    "email" character varying(100),
    "phone" character varying(20),
    "created_at" timestamp without time zone default now()
      );



  create table "public"."drivers" (
    "id" integer not null default nextval('public.drivers_id_seq'::regclass),
    "name" text not null,
    "phone" text,
    "license_number" text,
    "status" text default 'active'::text,
    "created_at" timestamp without time zone default now(),
    "base_salary" numeric default 0,
    "per_trip_rate" numeric default 0
      );



  create table "public"."inventory_items" (
    "id" integer not null default nextval('public.inventory_items_id_seq'::regclass),
    "name" character varying(100) not null,
    "current_stock" numeric,
    "unit" character varying(20),
    "min_stock_level" numeric
      );



  create table "public"."invoices" (
    "id" integer not null default nextval('public.invoices_id_seq'::regclass),
    "order_id" integer,
    "amount" numeric,
    "status" character varying(50) default 'pending'::character varying,
    "created_at" timestamp without time zone default now()
      );



  create table "public"."mix_designs" (
    "id" integer not null default nextval('public.mix_designs_id_seq'::regclass),
    "grade_name" character varying(50) not null,
    "description" text
      );



  create table "public"."mix_requirements" (
    "id" integer not null default nextval('public.mix_requirements_id_seq'::regclass),
    "mix_id" integer,
    "inventory_item_id" integer,
    "quantity_per_m3" numeric not null
      );



  create table "public"."orders" (
    "id" integer not null default nextval('public.orders_id_seq'::regclass),
    "customer_id" integer,
    "concrete_grade" character varying(50),
    "quantity" numeric,
    "status" character varying(50) default 'pending'::character varying,
    "delivery_address" text,
    "order_date" timestamp without time zone default now()
      );



  create table "public"."trip_updates" (
    "id" integer not null default nextval('public.trip_updates_id_seq'::regclass),
    "trip_id" integer,
    "location" jsonb,
    "note" text,
    "status" text,
    "created_at" timestamp without time zone default now()
      );



  create table "public"."trips" (
    "id" integer not null default nextval('public.trips_id_seq'::regclass),
    "order_id" integer,
    "vehicle_id" integer,
    "driver_id" integer,
    "assigned_by" integer,
    "status" text default 'assigned'::text,
    "eta" timestamp without time zone,
    "started_at" timestamp without time zone,
    "completed_at" timestamp without time zone,
    "created_at" timestamp without time zone default now(),
    "volume_delivered" numeric default 0,
    "fuel_cost_estimate" numeric default 0
      );



  create table "public"."users" (
    "id" integer not null default nextval('public.users_id_seq'::regclass),
    "email" character varying(255) not null,
    "password" character varying(255) not null,
    "name" character varying(100) not null,
    "role" character varying(50) default 'staff'::character varying,
    "created_at" timestamp without time zone default now()
      );



  create table "public"."vehicles" (
    "id" integer not null default nextval('public.vehicles_id_seq'::regclass),
    "plate_number" text not null,
    "model" text,
    "capacity" numeric,
    "status" text default 'available'::text,
    "created_at" timestamp without time zone default now()
      );


alter sequence "public"."customers_id_seq" owned by "public"."customers"."id";

alter sequence "public"."drivers_id_seq" owned by "public"."drivers"."id";

alter sequence "public"."inventory_items_id_seq" owned by "public"."inventory_items"."id";

alter sequence "public"."invoices_id_seq" owned by "public"."invoices"."id";

alter sequence "public"."mix_designs_id_seq" owned by "public"."mix_designs"."id";

alter sequence "public"."mix_requirements_id_seq" owned by "public"."mix_requirements"."id";

alter sequence "public"."orders_id_seq" owned by "public"."orders"."id";

alter sequence "public"."trip_updates_id_seq" owned by "public"."trip_updates"."id";

alter sequence "public"."trips_id_seq" owned by "public"."trips"."id";

alter sequence "public"."users_id_seq" owned by "public"."users"."id";

alter sequence "public"."vehicles_id_seq" owned by "public"."vehicles"."id";

CREATE UNIQUE INDEX customers_pkey ON public.customers USING btree (id);

CREATE UNIQUE INDEX drivers_pkey ON public.drivers USING btree (id);

CREATE UNIQUE INDEX inventory_items_pkey ON public.inventory_items USING btree (id);

CREATE UNIQUE INDEX invoices_pkey ON public.invoices USING btree (id);

CREATE UNIQUE INDEX mix_designs_grade_name_key ON public.mix_designs USING btree (grade_name);

CREATE UNIQUE INDEX mix_designs_pkey ON public.mix_designs USING btree (id);

CREATE UNIQUE INDEX mix_requirements_pkey ON public.mix_requirements USING btree (id);

CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id);

CREATE UNIQUE INDEX trip_updates_pkey ON public.trip_updates USING btree (id);

CREATE UNIQUE INDEX trips_pkey ON public.trips USING btree (id);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

CREATE UNIQUE INDEX vehicles_pkey ON public.vehicles USING btree (id);

CREATE UNIQUE INDEX vehicles_plate_number_key ON public.vehicles USING btree (plate_number);

alter table "public"."customers" add constraint "customers_pkey" PRIMARY KEY using index "customers_pkey";

alter table "public"."drivers" add constraint "drivers_pkey" PRIMARY KEY using index "drivers_pkey";

alter table "public"."inventory_items" add constraint "inventory_items_pkey" PRIMARY KEY using index "inventory_items_pkey";

alter table "public"."invoices" add constraint "invoices_pkey" PRIMARY KEY using index "invoices_pkey";

alter table "public"."mix_designs" add constraint "mix_designs_pkey" PRIMARY KEY using index "mix_designs_pkey";

alter table "public"."mix_requirements" add constraint "mix_requirements_pkey" PRIMARY KEY using index "mix_requirements_pkey";

alter table "public"."orders" add constraint "orders_pkey" PRIMARY KEY using index "orders_pkey";

alter table "public"."trip_updates" add constraint "trip_updates_pkey" PRIMARY KEY using index "trip_updates_pkey";

alter table "public"."trips" add constraint "trips_pkey" PRIMARY KEY using index "trips_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."vehicles" add constraint "vehicles_pkey" PRIMARY KEY using index "vehicles_pkey";

alter table "public"."invoices" add constraint "invoices_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) not valid;

alter table "public"."invoices" validate constraint "invoices_order_id_fkey";

alter table "public"."mix_designs" add constraint "mix_designs_grade_name_key" UNIQUE using index "mix_designs_grade_name_key";

alter table "public"."mix_requirements" add constraint "mix_requirements_inventory_item_id_fkey" FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) not valid;

alter table "public"."mix_requirements" validate constraint "mix_requirements_inventory_item_id_fkey";

alter table "public"."mix_requirements" add constraint "mix_requirements_mix_id_fkey" FOREIGN KEY (mix_id) REFERENCES public.mix_designs(id) not valid;

alter table "public"."mix_requirements" validate constraint "mix_requirements_mix_id_fkey";

alter table "public"."orders" add constraint "orders_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(id) not valid;

alter table "public"."orders" validate constraint "orders_customer_id_fkey";

alter table "public"."trip_updates" add constraint "trip_updates_trip_id_fkey" FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE not valid;

alter table "public"."trip_updates" validate constraint "trip_updates_trip_id_fkey";

alter table "public"."trips" add constraint "trips_assigned_by_fkey" FOREIGN KEY (assigned_by) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."trips" validate constraint "trips_assigned_by_fkey";

alter table "public"."trips" add constraint "trips_driver_id_fkey" FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON DELETE SET NULL not valid;

alter table "public"."trips" validate constraint "trips_driver_id_fkey";

alter table "public"."trips" add constraint "trips_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL not valid;

alter table "public"."trips" validate constraint "trips_order_id_fkey";

alter table "public"."trips" add constraint "trips_vehicle_id_fkey" FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE SET NULL not valid;

alter table "public"."trips" validate constraint "trips_vehicle_id_fkey";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

alter table "public"."vehicles" add constraint "vehicles_plate_number_key" UNIQUE using index "vehicles_plate_number_key";

grant delete on table "public"."customers" to "anon";

grant insert on table "public"."customers" to "anon";

grant references on table "public"."customers" to "anon";

grant select on table "public"."customers" to "anon";

grant trigger on table "public"."customers" to "anon";

grant truncate on table "public"."customers" to "anon";

grant update on table "public"."customers" to "anon";

grant delete on table "public"."customers" to "authenticated";

grant insert on table "public"."customers" to "authenticated";

grant references on table "public"."customers" to "authenticated";

grant select on table "public"."customers" to "authenticated";

grant trigger on table "public"."customers" to "authenticated";

grant truncate on table "public"."customers" to "authenticated";

grant update on table "public"."customers" to "authenticated";

grant delete on table "public"."customers" to "service_role";

grant insert on table "public"."customers" to "service_role";

grant references on table "public"."customers" to "service_role";

grant select on table "public"."customers" to "service_role";

grant trigger on table "public"."customers" to "service_role";

grant truncate on table "public"."customers" to "service_role";

grant update on table "public"."customers" to "service_role";

grant delete on table "public"."drivers" to "anon";

grant insert on table "public"."drivers" to "anon";

grant references on table "public"."drivers" to "anon";

grant select on table "public"."drivers" to "anon";

grant trigger on table "public"."drivers" to "anon";

grant truncate on table "public"."drivers" to "anon";

grant update on table "public"."drivers" to "anon";

grant delete on table "public"."drivers" to "authenticated";

grant insert on table "public"."drivers" to "authenticated";

grant references on table "public"."drivers" to "authenticated";

grant select on table "public"."drivers" to "authenticated";

grant trigger on table "public"."drivers" to "authenticated";

grant truncate on table "public"."drivers" to "authenticated";

grant update on table "public"."drivers" to "authenticated";

grant delete on table "public"."drivers" to "service_role";

grant insert on table "public"."drivers" to "service_role";

grant references on table "public"."drivers" to "service_role";

grant select on table "public"."drivers" to "service_role";

grant trigger on table "public"."drivers" to "service_role";

grant truncate on table "public"."drivers" to "service_role";

grant update on table "public"."drivers" to "service_role";

grant delete on table "public"."inventory_items" to "anon";

grant insert on table "public"."inventory_items" to "anon";

grant references on table "public"."inventory_items" to "anon";

grant select on table "public"."inventory_items" to "anon";

grant trigger on table "public"."inventory_items" to "anon";

grant truncate on table "public"."inventory_items" to "anon";

grant update on table "public"."inventory_items" to "anon";

grant delete on table "public"."inventory_items" to "authenticated";

grant insert on table "public"."inventory_items" to "authenticated";

grant references on table "public"."inventory_items" to "authenticated";

grant select on table "public"."inventory_items" to "authenticated";

grant trigger on table "public"."inventory_items" to "authenticated";

grant truncate on table "public"."inventory_items" to "authenticated";

grant update on table "public"."inventory_items" to "authenticated";

grant delete on table "public"."inventory_items" to "service_role";

grant insert on table "public"."inventory_items" to "service_role";

grant references on table "public"."inventory_items" to "service_role";

grant select on table "public"."inventory_items" to "service_role";

grant trigger on table "public"."inventory_items" to "service_role";

grant truncate on table "public"."inventory_items" to "service_role";

grant update on table "public"."inventory_items" to "service_role";

grant delete on table "public"."invoices" to "anon";

grant insert on table "public"."invoices" to "anon";

grant references on table "public"."invoices" to "anon";

grant select on table "public"."invoices" to "anon";

grant trigger on table "public"."invoices" to "anon";

grant truncate on table "public"."invoices" to "anon";

grant update on table "public"."invoices" to "anon";

grant delete on table "public"."invoices" to "authenticated";

grant insert on table "public"."invoices" to "authenticated";

grant references on table "public"."invoices" to "authenticated";

grant select on table "public"."invoices" to "authenticated";

grant trigger on table "public"."invoices" to "authenticated";

grant truncate on table "public"."invoices" to "authenticated";

grant update on table "public"."invoices" to "authenticated";

grant delete on table "public"."invoices" to "service_role";

grant insert on table "public"."invoices" to "service_role";

grant references on table "public"."invoices" to "service_role";

grant select on table "public"."invoices" to "service_role";

grant trigger on table "public"."invoices" to "service_role";

grant truncate on table "public"."invoices" to "service_role";

grant update on table "public"."invoices" to "service_role";

grant delete on table "public"."mix_designs" to "anon";

grant insert on table "public"."mix_designs" to "anon";

grant references on table "public"."mix_designs" to "anon";

grant select on table "public"."mix_designs" to "anon";

grant trigger on table "public"."mix_designs" to "anon";

grant truncate on table "public"."mix_designs" to "anon";

grant update on table "public"."mix_designs" to "anon";

grant delete on table "public"."mix_designs" to "authenticated";

grant insert on table "public"."mix_designs" to "authenticated";

grant references on table "public"."mix_designs" to "authenticated";

grant select on table "public"."mix_designs" to "authenticated";

grant trigger on table "public"."mix_designs" to "authenticated";

grant truncate on table "public"."mix_designs" to "authenticated";

grant update on table "public"."mix_designs" to "authenticated";

grant delete on table "public"."mix_designs" to "service_role";

grant insert on table "public"."mix_designs" to "service_role";

grant references on table "public"."mix_designs" to "service_role";

grant select on table "public"."mix_designs" to "service_role";

grant trigger on table "public"."mix_designs" to "service_role";

grant truncate on table "public"."mix_designs" to "service_role";

grant update on table "public"."mix_designs" to "service_role";

grant delete on table "public"."mix_requirements" to "anon";

grant insert on table "public"."mix_requirements" to "anon";

grant references on table "public"."mix_requirements" to "anon";

grant select on table "public"."mix_requirements" to "anon";

grant trigger on table "public"."mix_requirements" to "anon";

grant truncate on table "public"."mix_requirements" to "anon";

grant update on table "public"."mix_requirements" to "anon";

grant delete on table "public"."mix_requirements" to "authenticated";

grant insert on table "public"."mix_requirements" to "authenticated";

grant references on table "public"."mix_requirements" to "authenticated";

grant select on table "public"."mix_requirements" to "authenticated";

grant trigger on table "public"."mix_requirements" to "authenticated";

grant truncate on table "public"."mix_requirements" to "authenticated";

grant update on table "public"."mix_requirements" to "authenticated";

grant delete on table "public"."mix_requirements" to "service_role";

grant insert on table "public"."mix_requirements" to "service_role";

grant references on table "public"."mix_requirements" to "service_role";

grant select on table "public"."mix_requirements" to "service_role";

grant trigger on table "public"."mix_requirements" to "service_role";

grant truncate on table "public"."mix_requirements" to "service_role";

grant update on table "public"."mix_requirements" to "service_role";

grant delete on table "public"."orders" to "anon";

grant insert on table "public"."orders" to "anon";

grant references on table "public"."orders" to "anon";

grant select on table "public"."orders" to "anon";

grant trigger on table "public"."orders" to "anon";

grant truncate on table "public"."orders" to "anon";

grant update on table "public"."orders" to "anon";

grant delete on table "public"."orders" to "authenticated";

grant insert on table "public"."orders" to "authenticated";

grant references on table "public"."orders" to "authenticated";

grant select on table "public"."orders" to "authenticated";

grant trigger on table "public"."orders" to "authenticated";

grant truncate on table "public"."orders" to "authenticated";

grant update on table "public"."orders" to "authenticated";

grant delete on table "public"."orders" to "service_role";

grant insert on table "public"."orders" to "service_role";

grant references on table "public"."orders" to "service_role";

grant select on table "public"."orders" to "service_role";

grant trigger on table "public"."orders" to "service_role";

grant truncate on table "public"."orders" to "service_role";

grant update on table "public"."orders" to "service_role";

grant delete on table "public"."trip_updates" to "anon";

grant insert on table "public"."trip_updates" to "anon";

grant references on table "public"."trip_updates" to "anon";

grant select on table "public"."trip_updates" to "anon";

grant trigger on table "public"."trip_updates" to "anon";

grant truncate on table "public"."trip_updates" to "anon";

grant update on table "public"."trip_updates" to "anon";

grant delete on table "public"."trip_updates" to "authenticated";

grant insert on table "public"."trip_updates" to "authenticated";

grant references on table "public"."trip_updates" to "authenticated";

grant select on table "public"."trip_updates" to "authenticated";

grant trigger on table "public"."trip_updates" to "authenticated";

grant truncate on table "public"."trip_updates" to "authenticated";

grant update on table "public"."trip_updates" to "authenticated";

grant delete on table "public"."trip_updates" to "service_role";

grant insert on table "public"."trip_updates" to "service_role";

grant references on table "public"."trip_updates" to "service_role";

grant select on table "public"."trip_updates" to "service_role";

grant trigger on table "public"."trip_updates" to "service_role";

grant truncate on table "public"."trip_updates" to "service_role";

grant update on table "public"."trip_updates" to "service_role";

grant delete on table "public"."trips" to "anon";

grant insert on table "public"."trips" to "anon";

grant references on table "public"."trips" to "anon";

grant select on table "public"."trips" to "anon";

grant trigger on table "public"."trips" to "anon";

grant truncate on table "public"."trips" to "anon";

grant update on table "public"."trips" to "anon";

grant delete on table "public"."trips" to "authenticated";

grant insert on table "public"."trips" to "authenticated";

grant references on table "public"."trips" to "authenticated";

grant select on table "public"."trips" to "authenticated";

grant trigger on table "public"."trips" to "authenticated";

grant truncate on table "public"."trips" to "authenticated";

grant update on table "public"."trips" to "authenticated";

grant delete on table "public"."trips" to "service_role";

grant insert on table "public"."trips" to "service_role";

grant references on table "public"."trips" to "service_role";

grant select on table "public"."trips" to "service_role";

grant trigger on table "public"."trips" to "service_role";

grant truncate on table "public"."trips" to "service_role";

grant update on table "public"."trips" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

grant delete on table "public"."vehicles" to "anon";

grant insert on table "public"."vehicles" to "anon";

grant references on table "public"."vehicles" to "anon";

grant select on table "public"."vehicles" to "anon";

grant trigger on table "public"."vehicles" to "anon";

grant truncate on table "public"."vehicles" to "anon";

grant update on table "public"."vehicles" to "anon";

grant delete on table "public"."vehicles" to "authenticated";

grant insert on table "public"."vehicles" to "authenticated";

grant references on table "public"."vehicles" to "authenticated";

grant select on table "public"."vehicles" to "authenticated";

grant trigger on table "public"."vehicles" to "authenticated";

grant truncate on table "public"."vehicles" to "authenticated";

grant update on table "public"."vehicles" to "authenticated";

grant delete on table "public"."vehicles" to "service_role";

grant insert on table "public"."vehicles" to "service_role";

grant references on table "public"."vehicles" to "service_role";

grant select on table "public"."vehicles" to "service_role";

grant trigger on table "public"."vehicles" to "service_role";

grant truncate on table "public"."vehicles" to "service_role";

grant update on table "public"."vehicles" to "service_role";


