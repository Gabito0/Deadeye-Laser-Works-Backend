"use strict";

const db = require("../db");
const Review = require("../models/review");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");
const { NotFoundError, BadRequestError } = require("../expressError");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("getReview", function () {
  test("works", async function () {
    const review = await Review.getReview(1);
    expect(review).toEqual({
      reviewId: 1,
      userId: expect.any(Number),
      username: "u1",
      firstName: "U1F",
      reviewText: "Great service!",
      rating: 5,
      time: expect.any(Date),
      serviceId: 1,
    });
  });

  test("throws NotFoundError if no review with given ID", async function () {
    try {
      await Review.getReview(9999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("update", function () {
  test("works", async function () {
    const updatedReview = await Review.update(1, {
      reviewText: "Updated review text",
      rating: 4,
    });
    expect(updatedReview).toEqual({
      reviewId: 1,
      reviewText: "Updated review text",
      rating: 4,
      time: expect.any(Date),
    });

    const res = await db.query("SELECT * FROM reviews WHERE id = 1");
    expect(res.rows.length).toEqual(1);
    expect(res.rows[0]).toEqual({
      id: 1,
      user_id: expect.any(Number),
      review_text: "Updated review text",
      rating: 4,
      time: expect.any(Date),
      service_id: expect.any(Number),
    });
  });

  test("throws NotFoundError if no review with given ID", async function () {
    try {
      await Review.update(9999, { reviewText: "No review" });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("throws BadRequestError if no data provided", async function () {
    try {
      await Review.update(1, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe("addReview", function () {
  test("works", async function () {
    const newReview = await Review.addReview({
      userId: 1,
      serviceId: 1,
      reviewText: "New review text",
      rating: 5,
    });
    expect(newReview).toEqual({
      reviewId: expect.any(Number),
      userId: 1,
      serviceId: 1,
      reviewText: "New review text",
      rating: 5,
      time: expect.any(Date),
    });

    const res = await db.query(
      "SELECT * FROM reviews WHERE review_text = 'New review text'"
    );
    expect(res.rows.length).toEqual(1);
    expect(res.rows[0]).toEqual({
      id: newReview.reviewId,
      user_id: 1,
      service_id: 1,
      review_text: "New review text",
      rating: 5,
      time: expect.any(Date),
    });
  });

  test("throws BadRequestError if missing required fields", async function () {
    try {
      await Review.addReview({ userId: 1, reviewText: "Incomplete review" });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }

    try {
      await Review.addReview({});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe("Review.remove", function () {
  test("works", async function () {
    await Review.remove(1);
    const res = await db.query("SELECT * FROM reviews WHERE id = 1");
    expect(res.rows.length).toEqual(0);
  });

  test("throws NotFoundError if no review with given ID", async function () {
    try {
      await Review.remove(9999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
