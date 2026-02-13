import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create Super Admin
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@bapekom.go.id" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@bapekom.go.id",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      division: "UMUM",
    },
  });

  console.log(`✅ Super Admin created: ${superAdmin.email}`);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: "pengelola@bapekom.go.id" },
    update: {},
    create: {
      name: "Admin Pengelola",
      email: "pengelola@bapekom.go.id",
      password: hashedPassword,
      role: "ADMIN",
      division: "KEUANGAN",
    },
  });

  console.log(`✅ Admin created: ${admin.email}`);

  // Create sample users for each division
  const divisions = [
    { division: "KEUANGAN", name: "Staff Keuangan", email: "keuangan@bapekom.go.id" },
    { division: "PENYELENGGARA", name: "Staff Penyelenggara", email: "penyelenggara@bapekom.go.id" },
    { division: "TATA_USAHA", name: "Staff Tata Usaha", email: "tatausaha@bapekom.go.id" },
    { division: "UMUM", name: "Staff Umum", email: "umum@bapekom.go.id" },
  ] as const;

  for (const div of divisions) {
    const user = await prisma.user.upsert({
      where: { email: div.email },
      update: {},
      create: {
        name: div.name,
        email: div.email,
        password: hashedPassword,
        role: "USER",
        division: div.division,
      },
    });
    console.log(`✅ User created: ${user.email} (${div.division})`);
  }

  console.log("\n🎉 Seeding complete!");
  console.log("\n📋 Login credentials:");
  console.log("   Super Admin  : admin@bapekom.go.id / admin123");
  console.log("   Admin        : pengelola@bapekom.go.id / admin123");
  console.log("   User Keuangan: keuangan@bapekom.go.id / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
