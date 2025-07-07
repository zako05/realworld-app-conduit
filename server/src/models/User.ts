import { Schema, model, HookNextFunction } from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "can't be blank"],
      unique: true,
      index: true,
      match: [/^[a-zA-Z0-9]+$/, "is invalid"],
    },
    email: {
      type: String,
      required: [true, "can't be blank"],
      unique: true,
      index: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "is invalid"],
    },
    password: {
      type: String,
      required: true,
      minglength: [8, "Password must be at least 8 characters long"],
      validate: {
        validator: function (v: string) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v);
        },
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      },
    },
    bio: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "https://static.productionready.io/images/smiley-cyrus.jpg",
    },
  },
  { timestamps: true },
);

UserSchema.pre("save", async function (next: HookNextFunction) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    // const salt = await bcrypt.hash(this.password, salt)

    this.password = await bcrypt.hash(this.password, salt);

    return next();
  } catch (err) {
    return next(err as Error);
  }
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = model("User", UserSchema);

export default User;
