import { HttpResponse } from "msw";

export const delay = (ms = 200) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const ok = (data, message = "Success") =>
  HttpResponse.json({ success: true, message, data });

export const created = (data, message = "Created successfully") =>
  HttpResponse.json({ success: true, message, data }, { status: 201 });

export const notFound = (message = "Resource not found") =>
  HttpResponse.json({ success: false, message }, { status: 404 });

export const badRequest = (message = "Invalid request") =>
  HttpResponse.json({ success: false, message }, { status: 400 });

export const conflict = (message = "Resource already exists") =>
  HttpResponse.json({ success: false, message }, { status: 409 });

export const serverError = (message = "Internal server error") =>
  HttpResponse.json({ success: false, message }, { status: 500 });

export const unauthorized = (message = "Unauthorized") =>
  HttpResponse.json({ success: false, message }, { status: 401 });

export const parseSearch = (url) => {
  const search = url.searchParams.get("search") || "";
  return search.trim().toLowerCase();
};

export const filterBySearch = (list, term, fields) => {
  if (!term) return list;
  return list.filter((item) =>
    fields.some((f) => item[f]?.toString().toLowerCase().includes(term)),
  );
};

export const parsePagination = (url) => {
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 0;
  return { page, limit };
};

export const paginate = (list, page, limit) => {
  if (!limit) return list;
  const start = (page - 1) * limit;
  return list.slice(start, start + limit);
};
