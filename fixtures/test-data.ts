export const TEST_USERS = {
  dispatcher: {
    email: process.env.TEST_DISPATCHER_EMAIL ?? "dispatcher@demo.com",
    password: process.env.TEST_DISPATCHER_PASSWORD ?? "Demo1234!",
    username: "dispatcher",
    fullName: "Тетяна Романенко",
    isStaff: true,
  },
  tenant: {
    email: process.env.TEST_TENANT_EMAIL ?? "tenant@demo.com",
    password: process.env.TEST_TENANT_PASSWORD ?? "Demo1234!",
    username: "tenant",
    fullName: "Іван Тестовий",
    isStaff: false,
  },
  guard: {
    email: process.env.TEST_GUARD_EMAIL ?? "guard@demo.com",
    password: process.env.TEST_GUARD_PASSWORD ?? "Demo1234!",
    username: "guard",
    fullName: "Микола Охоронець",
    isStaff: false,
  },
  resident1: {
    email: process.env.TEST_RESIDENT_EMAIL ?? "resident1@demo.com",
    password: process.env.TEST_RESIDENT_PASSWORD ?? "Demo1234!",
    username: "resident1",
  },
};

export const INVALID_CREDENTIALS = {
  email: "nonexistent@test.com",
  password: "WrongPassword123!",
};

export const INVALID_EMAIL_FORMAT = "not-an-email";
