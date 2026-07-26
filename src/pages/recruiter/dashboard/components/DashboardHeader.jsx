const GREETING_FONT = "'Google Sans Flex', 'DM Sans', sans-serif";

export default function DashboardHeader({ userName }) {
  const firstName = (userName || 'Recruiter').split(' ')[0];

  return (
    <div style={{ fontFamily: GREETING_FONT }}>
      <h1 className="text-[26px] lg:text-[24px] xl:text-[26px] 2xl:text-[28px] leading-[1.25] lg:leading-[32px] text-black" style={{ fontWeight: 500 }}>
        Welcome back, <span style={{ color: 'var(--color-assessment-accent)' }}>{firstName}</span>
      </h1>
      <h1 className="text-[26px] lg:text-[24px] xl:text-[26px] 2xl:text-[28px] leading-[1.25] lg:leading-[32px] text-black" style={{ fontWeight: 500 }}>
        Here&apos;s your recruitment overview.
      </h1>
      <p className="text-[13px] text-[#7D7D7D] mt-1.5 lg:mt-1 leading-[1.5]" style={{ fontWeight: 500 }}>
        Track your hiring pipeline, candidate progress, and assessment activity — all in one place.
      </p>
    </div>
  );
}
