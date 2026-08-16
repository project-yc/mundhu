import inviteTeamImg from '../../../../assets/recruiter/images/invite_team.svg';
import scenarioLibraryImg from '../../../../assets/recruiter/images/scenario_library.svg';
import templateImg from '../../../../assets/recruiter/images/template.svg';
import adaptiveCardBg from '../../../../assets/recruiter/images/initial_adaptive_card.svg';

const HEADING_FONT = "'Google Sans Flex', 'DM Sans', sans-serif";

function CtaButton({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center px-3.5 py-[7px] rounded-lg text-[11.5px] lg:text-[12px] font-semibold text-white transition-colors ${className}`}
      style={{ backgroundColor: 'var(--color-assessment-cta)' }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-assessment-cta-hover)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-assessment-cta)'; }}
      {...props}
    >
      {children}
    </button>
  );
}

function ActionCard({ title, description, ctaLabel, onClick, image }) {
  return (
    <div className="flex-1 min-w-0 bg-white border border-[#e8e8e8] rounded-2xl shadow-[0px_0px_11.6px_-2px_rgba(0,0,0,0.03)] relative overflow-hidden h-[220px] lg:h-[220px] xl:h-[248px] 2xl:h-[270px]">
      <div className="px-[15px] pt-[13px] lg:px-[16px] lg:pt-[14px] relative z-10">
        <p className="text-[13px] lg:text-[13.5px] font-medium text-black leading-[16px]">{title}</p>
        <p className="text-[11px] lg:text-[11.5px] text-[#7a7a7a] leading-[15px] mt-[6px] max-w-[200px]">{description}</p>
        <CtaButton onClick={onClick} className="mt-[14px]">{ctaLabel}</CtaButton>
      </div>
      <img
        src={image}
        alt=""
        className="pointer-events-none select-none absolute left-1/2 -translate-x-1/2 bottom-[-14px] w-[130px] lg:w-[136px] xl:w-[152px] 2xl:w-[164px] h-auto"
      />
    </div>
  );
}

export default function EmptyDashboardState({ userName, onCreateAssessment, onInviteTeam, onOpenLibrary, onBrowseTemplates }) {
  const firstName = (userName || 'Recruiter').split(' ')[0];

  return (
    <div className="flex flex-col gap-3.5 lg:gap-3 xl:gap-4 2xl:gap-5 max-w-[920px] lg:max-w-[900px] xl:max-w-[1020px] 2xl:max-w-[1120px]">
      {/* Greeting */}
      <div style={{ fontFamily: HEADING_FONT }}>
        <h1 className="text-[21px] lg:text-[21px] xl:text-[24px] 2xl:text-[26px] leading-[1.25] text-black" style={{ fontWeight: 500 }}>
          Welcome, <span style={{ color: 'var(--color-assessment-accent)' }}>{firstName}!</span>
        </h1>
        <h1 className="text-[21px] lg:text-[21px] xl:text-[24px] 2xl:text-[26px] leading-[1.25] text-black" style={{ fontWeight: 500 }}>
          Ready to discover your next great hire?
        </h1>
        <p className="text-[12px] lg:text-[12.5px] text-[#7d7d7d] mt-1.5 leading-[1.5] max-w-[833px]" style={{ fontWeight: 500 }}>
          Hello {firstName}! Create assessments, monitor candidate progress, and explore AI-powered interview insights.
        </p>
      </div>

      {/* Top row: AI Adaptive Interview banner + Ready to hire card */}
      <div className="flex gap-2.5 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 items-stretch">
        <div className="flex-1 min-w-0 relative rounded-2xl overflow-hidden h-[130px] lg:h-[130px] xl:h-[150px] 2xl:h-[164px]">
          <img
            src={adaptiveCardBg}
            alt="AI Adaptive Interview — see how it works"
            className="absolute inset-0 w-full h-full object-cover object-left"
          />
          {/* Invisible hit target over the baked-in "See how it works" button */}
          <button
            type="button"
            aria-label="See how it works"
            className="absolute"
            style={{ left: '2.3%', bottom: '8%', width: '17.4%', height: '16.5%' }}
          />
        </div>

        <div className="w-[220px] lg:w-[210px] xl:w-[230px] 2xl:w-[250px] flex-shrink-0 bg-white border border-[#e4e4e4] rounded-2xl h-[130px] lg:h-[130px] xl:h-[150px] 2xl:h-[164px] relative overflow-hidden">
          <p className="absolute left-[15px] top-[12px] text-[12px] lg:text-[12.5px] font-medium text-black leading-[16px] max-w-[180px]">
            Ready to Hire Your First Candidate?
          </p>
          <p className="absolute left-[15px] top-[42px] text-[10.5px] lg:text-[11px] text-[#7a7a7a] leading-[14px] max-w-[190px]">
            Publish your first AI-powered assessment in just a few steps. Invite candidates and start reviewing reports.
          </p>
          <CtaButton onClick={onCreateAssessment} className="absolute left-[15px] bottom-[13px]">
            Create assessment
          </CtaButton>
        </div>
      </div>

      {/* Bottom row: 3 empty-state cards */}
      <div className="flex gap-2.5 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 items-stretch">
        <ActionCard
          title="Invite your team"
          description="Begin by inviting your teammates to become part of the workspace."
          ctaLabel="Invite team"
          image={inviteTeamImg}
          onClick={onInviteTeam}
        />
        <ActionCard
          title="Explore Scenario Library"
          description="Find real-world interview scenarios for technical, behavioral, and situational rounds."
          ctaLabel="Open task library"
          image={scenarioLibraryImg}
          onClick={onOpenLibrary}
        />
        <ActionCard
          title="Start with Templates"
          description="Launch interviews faster using ready-made assessment templates for popular roles."
          ctaLabel="Browse templates"
          image={templateImg}
          onClick={onBrowseTemplates}
        />
      </div>
    </div>
  );
}
