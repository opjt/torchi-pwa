<script>
    import "$src/app.css";
</script>

<div class="">
  
  <header class="flex items-center px-6 py-5 border-b border-slate-50">
    <a class="p-2 -ml-2 mr-2 text-slate-400" href="/">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    </a>
    <h1 class="text-lg font-bold">설정</h1>
  </header>

  <main class="flex-1 overflow-y-auto">
    
    <section class="p-6">
      <h2 class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">내 정보</h2>
      <div class="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
        <div class="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">
          U
        </div>
        <div>
          <p class="font-semibold text-sm">사용자님 (user@example.com)</p>
          <p class="text-xs text-slate-400">무료 플랜 이용 중</p>
        </div>
      </div>
    </section>

    <section class="p-6 pt-0">
      <h2 class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">푸시 엔드포인트</h2>
      <div class="space-y-3">
        <p class="text-xs text-slate-500 leading-relaxed">이 URL로 POST 요청을 보내면 현재 기기로 푸시 알림이 즉시 전송됩니다.</p>
        <div class="flex gap-2">
          <input type="text" readonly value="https://api.pushlink.com/v1/send/abc123xyz" 
            class="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-xs font-mono text-slate-600 focus:outline-none" />
          <button class="btn btn-neutral" title="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          </button>
        </div>
      </div>
    </section>

    <section class="p-6 pt-0">
      <h2 class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">서비스 설정</h2>
      <div class="space-y-1">
        <div class="flex items-center justify-between py-3">
          <div>
            <p class="text-sm font-medium">푸시 알림 활성화</p>
            <p class="text-xs text-slate-400">기기에서 알림을 수신합니다</p>
          </div>
          <input type="checkbox" class="toggle  toggle-sm" checked />
        </div>
        
        <div class="divider opacity-30"></div>

        <button class="w-full py-3 flex items-center justify-between text-sm font-medium group">
          <span>알림 테스트 전송</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-300 group-active:translate-x-1 transition-transform"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </section>

    <section class="p-6 pt-10">
      <button class="btn w-full btn-outline">
        로그아웃
      </button>
      <p class="text-center text-[10px] text-slate-300 mt-6 font-mono tracking-tighter">APP VERSION 1.0.0 (BETA)</p>
    </section>

  </main>
</div>