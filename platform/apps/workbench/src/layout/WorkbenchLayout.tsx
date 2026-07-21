import { NavLink, Outlet } from 'react-router'

const navigation = [
  { to: '/', label: '总览' },
  { to: '/projects', label: '工厂项目' },
]

function NavigationLinks() {
  return navigation.map((item) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
    >
      {item.label}
    </NavLink>
  ))
}

export function WorkbenchLayout() {
  return (
    <div className="workbench-shell">
      <aside className="sidebar" aria-label="主导航">
        <div className="brand-mark" aria-hidden="true">AI</div>
        <div className="brand-copy">
          <strong>外贸增长工作台</strong>
          <span>Factory Intelligence</span>
        </div>
        <nav><NavigationLinks /></nav>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <details className="mobile-navigation">
            <summary>菜单</summary>
            <nav><NavigationLinks /></nav>
          </details>
          <div>
            <span className="environment-dot" aria-hidden="true" />
            内部共创环境
          </div>
        </header>
        <div className="workspace-content"><Outlet /></div>
      </div>
    </div>
  )
}
