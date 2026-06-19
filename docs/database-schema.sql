create table users (
  id uuid primary key,
  name text not null,
  email text not null,
  phone text,
  created_at timestamp with time zone default now()
);

create table devices (
  id uuid primary key,
  ble_device_id text not null,
  name text not null,
  model text,
  created_at timestamp with time zone default now()
);

create table sessions (
  id uuid primary key,
  user_id uuid references users(id),
  device_id uuid references devices(id),
  started_at timestamp with time zone not null,
  ended_at timestamp with time zone,
  duration_seconds int,
  total_commands int default 0,
  created_at timestamp with time zone default now()
);

create table command_logs (
  id uuid primary key,
  session_id uuid references sessions(id),
  user_id uuid references users(id),
  device_id uuid references devices(id),
  command text not null,
  action_label text not null,
  success boolean not null,
  error_message text,
  created_at timestamp with time zone default now()
);

create table app_settings (
  id uuid primary key,
  key text not null unique,
  value jsonb not null,
  updated_at timestamp with time zone default now()
);
