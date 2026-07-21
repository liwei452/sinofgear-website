import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router'
import { z } from 'zod'
import { apiRequest } from '../api/client'

const loginSchema = z.object({
  email: z.email('请输入有效邮箱'),
  password: z.string().min(1, '请输入密码'),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })
  const login = useMutation({
    mutationFn: (values: LoginValues) => apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(values),
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['session'] })
      const from = (location.state as { from?: string } | null)?.from ?? '/projects'
      navigate(from, { replace: true })
    },
  })

  return (
    <main className="login-shell">
      <section className="login-story">
        <span className="eyebrow">AI EXPORT OPERATIONS</span>
        <h1>把工厂能力，变成可验证的海外增长方向。</h1>
        <p>从资料采集、能力确认到市场方向选择，每个结论都有依据，每个决策都可追溯。</p>
      </section>
      <section className="login-card" aria-labelledby="login-title">
        <span className="eyebrow">团队内部入口</span>
        <h2 id="login-title">登录工作台</h2>
        <form onSubmit={form.handleSubmit((values) => login.mutate(values))}>
          <label htmlFor="email">邮箱</label>
          <input id="email" type="email" autoComplete="username" required {...form.register('email')} />
          {form.formState.errors.email && <p className="field-error">{form.formState.errors.email.message}</p>}

          <label htmlFor="password">密码</label>
          <input id="password" type="password" autoComplete="current-password" required {...form.register('password')} />
          {form.formState.errors.password && <p className="field-error">{form.formState.errors.password.message}</p>}

          {login.isError && <p className="form-error" role="alert">{login.error.message}</p>}
          <button className="primary-button" type="submit" disabled={login.isPending}>
            {login.isPending ? '正在登录…' : '登录'}
          </button>
        </form>
      </section>
    </main>
  )
}
