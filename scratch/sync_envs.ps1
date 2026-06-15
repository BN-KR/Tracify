$envs = @(
    @("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "pk_live_Y2xlcmsuNXRvMXIuY29tJA"),
    @("CLERK_SECRET_KEY", "sk_live_4Hp6OotWwQKsV0VDeonUXqeYp34hWdMYL9GjlCZP8R"),
    @("CLERK_JWT_ISSUER_DOMAIN", "https://clerk.5to1r.com"),
    @("NEXT_PUBLIC_CONVEX_URL", "https://focused-otter-289.convex.cloud"),
    @("CONVEX_DEPLOYMENT", "prod:focused-otter-289"),
    @("NEXT_PUBLIC_CONVEX_SITE_URL", "https://focused-otter-289.convex.site"),
    @("FIVETOONE_API_KEY_HASH_SECRET", "f1076ddaa812586413f0c1773e62ca6caee9640886ff4c843b96dae8bd6d89f9"),
    @("TINYBIRD_TOKEN", "p.eyJ1IjogIjk5NzNmZWRkLTUyZjMtNDU1ZC1hN2Q3LWUwZmNlYzAyOWI4OCIsICJpZCI6ICI1YjhiOWM2My1iODA1LTRlMmYtYTU1Ni04YzhjZWQyNmEyY2EiLCAiaG9zdCI6ICJnY3AtZXVyb3BlLXdlc3QyIn0.5SUmmRqvLcHkDn93XVQVzjHn8T59ySjI3atnBrX6z1w"),
    @("TINYBIRD_HOST", "https://api.europe-west2.gcp.tinybird.co"),
    @("INNGEST_EVENT_KEY", "tlxI4icuc_ObeHIOvreMMLA-SsCR0_cjXk09PPkDudmqppe9cr5TFLGs7tOZz-VKzS6CD5WdJmVMBlLEyh_GEw"),
    @("GOOGLE_CLIENT_ID", "541541360433-ru274njhk8l12h2qbrvv80tdbinfu0po.apps.googleusercontent.com"),
    @("GOOGLE_CLIENT_SECRET", "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")
)

foreach ($env in $envs) {
    $key = $env[0]
    $val = $env[1]
    Write-Host "Adding $key..."
    npx vercel env add $key production --value $val --scope 5to1r --force --yes
}
