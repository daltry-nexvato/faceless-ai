import type { NextConfig } from "next";
import { withAmplify } from "@aws-amplify/adapter-nextjs";

const nextConfig: NextConfig = {};

export default withAmplify(nextConfig);
