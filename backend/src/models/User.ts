import mongoose from 'mongoose';
import bcryptjs from 'bcrypt';

interface IUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'creator' | 'reviewer' | 'viewer';
  workspace_id?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'creator', 'reviewer', 'viewer'],
      default: 'creator',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (this: any) {
  if (!this.isModified('password')) return;
  
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});


// Method to compare passwords
userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return await bcryptjs.compare(password, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
