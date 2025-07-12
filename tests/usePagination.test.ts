import { describe, it, expect } from "vitest";
import { usePagination } from "@/composables/usePagination";

describe("usePagination", () => {
  it("initializes with default values", () => {
    const pagination = usePagination();
    expect(pagination.page.value).toBe(1);
    expect(pagination.limit.value).toBe(30);
    expect(pagination.total.value).toBe(0);
    expect(pagination.totalPages.value).toBe(0);
  });

  it("builds params correctly", () => {
    const pagination = usePagination(10);
    const params = pagination.buildParams();
    expect(params).toEqual({
      sort: "updatedAt",
      order: "desc",
      page: 1,
      limit: 10,
    });
  });

  it("handles next page", () => {
    const pagination = usePagination();
    pagination.setTotal(100);
    pagination.nextPage();
    expect(pagination.page.value).toBe(2);
    pagination.page.value = 4; // assuming 100/30 ≈ 3.33, totalPages=4
    pagination.nextPage();
    expect(pagination.page.value).toBe(4); // doesn't exceed
  });

  it("handles prev page", () => {
    const pagination = usePagination();
    pagination.setTotal(100);
    pagination.page.value = 2;
    pagination.prevPage();
    expect(pagination.page.value).toBe(1);
    pagination.prevPage();
    expect(pagination.page.value).toBe(1); // doesn't go below 1
  });

  it("updates totalPages when total changes", () => {
    const pagination = usePagination(20);
    pagination.setTotal(50);
    expect(pagination.totalPages.value).toBe(3);
    pagination.setTotal(0);
    expect(pagination.totalPages.value).toBe(0);
  });

  it("handles limit of 0", () => {
    const pagination = usePagination(0);
    pagination.setTotal(100);
    expect(pagination.totalPages.value).toBe(Infinity); // edge case
    pagination.nextPage();
    expect(pagination.page.value).toBe(1); // since Infinity
  });
});
