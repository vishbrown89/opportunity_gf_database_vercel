const handleLogout = async () => {
  try {
    await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include',
    })
  } catch {}

  clearAdminSession()
  router.push('/admin/login')
}
