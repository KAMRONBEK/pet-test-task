import { validationSchema } from "../screens/MainScreen";

describe("Validation Schema", () => {
  it("should validate valid input correctly", async () => {
    const validData = {
      name: "Buddy",
      age: "3",
      description: "A friendly dog",
    };

    await expect(validationSchema.isValid(validData)).resolves.toBe(true);
  });

  it("should require name", async () => {
    const invalidData = {
      name: "",
      age: "3",
      description: "A friendly dog",
    };

    await expect(validationSchema.isValid(invalidData)).resolves.toBe(false);
  });

  it("should require a valid age (number, positive)", async () => {
    const invalidData = {
      name: "Buddy",
      age: "-1",
      description: "A friendly dog",
    };

    await expect(validationSchema.isValid(invalidData)).resolves.toBe(false);
  });

  it("should require a valid age (numeric)", async () => {
    const invalidData = {
      name: "Buddy",
      age: "abc",
      description: "A friendly dog",
    };

    await expect(validationSchema.isValid(invalidData)).resolves.toBe(false);
  });
});
