# authentication: Google
URL: /docs/authentication/google
Source: https://raw.githubusercontent.com/better-auth/better-auth/refs/heads/main/docs/content/docs/authentication/google.mdx

Google 提供商设置与使用指南。
        
***

title: Google
description: Google 提供商设置与使用指南。
-------------------------------

<Steps>
  <Step>
    ### 获取 Google 凭据

    要使用 Google 作为社交登录提供商，您需要获取 Google 凭据。您可以在 [Google Cloud Console](https://console.cloud.google.com/apis/dashboard) 中创建新项目来获取这些凭据。

    在 Google Cloud Console > 凭据 > 授权重定向 URI 中，请确保将本地开发的重定向 URL 设置为 `http://localhost:3000/api/auth/callback/google`。对于生产环境，请确保将重定向 URL 设置为您的应用程序域名，例如 `https://example.com/api/auth/callback/google`。如果您更改了认证路由的基础路径，应相应地更新重定向 URL。
  </Step>

  <Step>
    ### 配置提供商

    要配置提供商，您需要在认证配置中将 `clientId` 和 `clientSecret` 传递给 `socialProviders.google`。

    ```ts title="auth.ts"
    import { betterAuth } from "better-auth"

    export const auth = betterAuth({
        socialProviders: {
            google: { // [!code highlight]
                clientId: process.env.GOOGLE_CLIENT_ID as string, // [!code highlight]
                clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, // [!code highlight]
            }, // [!code highlight]
        },
    })
    ```
  </Step>
</Steps>

## 使用方法

### 使用 Google 登录

要使用 Google 登录，您可以使用客户端提供的 `signIn.social` 函数。`signIn` 函数接受一个包含以下属性的对象：

* `provider`：要使用的提供商。应设置为 `google`。

```ts title="auth-client.ts"  /
import { createAuthClient } from "better-auth/client";
const authClient = createAuthClient();

const signIn = async () => {
  const data = await authClient.signIn.social({
    provider: "google",
  });
};
```

### 使用 Google ID Token 登录

要通过 Google ID Token 进行登录，您可以使用 `signIn.social` 函数传递 ID Token。

当您在客户端获取到 Google 的 ID Token 并希望在服务器端使用它进行登录时，这非常有用。

<Callout>
  如果提供了 ID token，将不会发生重定向，用户将直接登录。
</Callout>

```ts title="auth-client.ts"
const data = await authClient.signIn.social({
    provider: "google",
    idToken: {
        token: // Google ID Token,
        accessToken: // Google Access Token
    }
})
```

<Callout>
  如果您想使用 Google 一键登录，可以参考 [One Tap 插件](/docs/plugins/one-tap)指南。
</Callout>

### 始终要求选择账户

如果您希望始终要求用户选择账户，可以向提供者传递 `prompt` 参数，并将其设置为 `select_account`。

```ts
socialProviders: {
    google: {
        prompt: "select_account", // [!code highlight]
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
}
```

### 请求额外的 Google 权限范围

如果您的应用在用户注册后需要额外的 Google 权限范围（例如，用于 Google Drive、Gmail 或其他 Google 服务），您可以使用 `linkSocial` 方法并指定相同的 Google 身份提供者来请求这些权限。

```ts title="auth-client.ts"
const requestGoogleDriveAccess = async () => {
  await authClient.linkSocial({
    provider: "google",
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });
};

// 在 React 组件中的使用示例
return (
  <button onClick={requestGoogleDriveAccess}>
    添加 Google Drive 权限
  </button>
);
```

这将触发一个新的 OAuth 流程，请求额外的权限范围。完成后，您的账户将在数据库中拥有新的权限范围，并且访问令牌将允许您访问所请求的 Google API。

<Callout>
  请确保您使用的是 Better Auth 版本 1.2.7 或更高版本，以避免在向同一身份提供者请求额外权限范围时出现“社交账户已关联”错误。
</Callout>

### 始终获取刷新令牌

Google 仅在用户首次同意您的应用时颁发刷新令牌。
如果用户已经授权了您的应用，后续的 OAuth 流程将仅返回访问令牌，而不会返回刷新令牌。

要始终获取刷新令牌，您可以在身份提供者选项中设置 `accessType` 为 `offline`，并将 `prompt` 设置为 `select_account consent`。

```ts
socialProviders: {
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        accessType: "offline", // [!code highlight]
        prompt: "select_account consent", // [!code highlight]
    },
}
```

<Callout>
  **撤销访问权限：** 如果您想为已经授权您的应用的用户获取新的刷新令牌，必须让用户在他们的 Google 账户设置中撤销您应用的访问权限，然后重新授权。
</Callout>

