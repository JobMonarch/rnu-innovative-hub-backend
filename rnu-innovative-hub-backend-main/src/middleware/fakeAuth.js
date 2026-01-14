export default function fakeAuth(req, res, next) {
  req.user = {
    email: "student@rnu.lv",
    role: "student"
  };
  next();
}
