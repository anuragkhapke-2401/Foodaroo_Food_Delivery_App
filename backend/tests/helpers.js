export const createMockReq = (overrides = {}) => ({
  headers: {},
  body: {},
  params: {},
  query: {},
  ...overrides,
});

export const createMockRes = () => {
  const res = {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.data = body;
      return this;
    },
    send(body) {
      this.data = body;
      return this;
    },
    redirect(url) {
      this.redirectUrl = url;
      return this;
    },
  };
  return res;
};
