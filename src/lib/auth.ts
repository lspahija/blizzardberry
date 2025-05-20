import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [GitHub, Google],
    callbacks: {
        async redirect({ url, baseUrl }) {
            return baseUrl + "/dashboard";
        },
    },
})

export { auth as middleware }

export const config = {
    matcher: ["/dashboard"],
};