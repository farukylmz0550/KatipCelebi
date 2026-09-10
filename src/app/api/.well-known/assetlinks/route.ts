import { NextResponse } from "next/server";

export async function GET() {
  const fingerprint = process.env.ANDROID_SHA256_FINGERPRINT || "YOUR_SHA256_FINGERPRINT_HERE";

  return NextResponse.json([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.farukylmz.bookshelf",
        sha256_cert_fingerprints: [fingerprint],
      },
    },
  ]);
}
