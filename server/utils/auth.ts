import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class AuthUtils {
  private static readonly SALT_ROUNDS = 12;

  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
    return bcrypt.hash(password, salt);
  }

  /**
   * Verify a password against its hash
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate a secure random token
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a verification code
   */
  static generateVerificationCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * Generate a password reset token
   */
  static generatePasswordResetToken(): {token: string, expires: Date} {
    const token = this.generateSecureToken(64);
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour expiry
    return { token, expires };
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
      score += 2;
    } else {
      feedback.push('Password must be at least 8 characters long');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain lowercase letters');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain uppercase letters');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain numbers');
    }

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 2;
    } else {
      feedback.push('Password must contain special characters');
    }

    if (password.length >= 12) {
      score += 1;
    }

    return {
      isValid: score >= 5,
      score: Math.min(score, 7),
      feedback
    };
  }

  /**
   * Generate admin access token
   */
  static generateAdminToken(): string {
    return `admin_${Date.now()}_${this.generateSecureToken(16)}`;
  }
}