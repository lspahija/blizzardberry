import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [GitHub],
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