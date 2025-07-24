<website_design>
This niche-based CRM platform combines a sophisticated landing page with a comprehensive SaaS application interface. The landing page showcases the platform's multi-niche capabilities with a professional yet vibrant design, while the main application provides a monday.com-inspired interface tailored for creators, coaches, podcasters, and freelancers.

The website opens with a modern hero section featuring a clean navigation bar and compelling messaging about niche-specific CRM solutions. The hero includes a prominent product screenshot showing the customizable dashboard interface. Following sections demonstrate key features through interactive elements, showcase different niche customizations, present pricing tiers, and conclude with social proof and a call-to-action.

The main application interface centers around a collapsible sidebar navigation system with primary sections: Dashboard, CRM, Calendar, Analytics, and Programs/Content (dynamically labeled based on selected niche). The dashboard presents a grid of metric cards specific to each niche, with real-time statistics and filtering capabilities. The CRM section features drag-and-drop pipeline management with 10 customizable stages per niche, opportunity cards with rich field editing through modals, and advanced filtering systems.

The calendar integrates seamlessly with CRM data, showing niche-specific scheduling logic and task management. Analytics provides comprehensive reporting with niche-isolated data and easy sharing capabilities. The Programs/Content section adapts its interface based on the selected niche (showing "Programs" for coaches, "Content" for creators, etc.).

All components work together through a modular design system supporting multiple niches per user, with clear visual differentiation and easy switching between niche contexts. The interface maintains monday.com's familiar patterns while introducing niche-specific customizations and a more vibrant, creator-friendly aesthetic.
</website_design>

<high_level_design>
**Color Palette:**
- Primary: Emerald (#10b981) - Professional yet vibrant, perfect for growth-focused businesses
- Secondary: Orange (#f97316) - Energetic accent for CTAs and highlights
- Neutrals: Slate grays (#64748b, #475569, #334155) with pure white backgrounds
- Background: Clean whites (#ffffff) with subtle gray sections (#f8fafc)

**Typography:**
- Primary Font Family: Inter - Modern, highly readable, professional yet approachable, excellent for both marketing content and application interfaces
</high_level_design>

<components>

<edit_component>
<file_path>src/components/blocks/heros/split-with-screenshot.tsx</file_path>
<design_instructions>Update the hero section for the CRM platform landing page. Change the main heading to "The CRM That Grows With Your Creative Business" with a subheading of "Tailored pipelines for creators, coaches, podcasters, and freelancers. Build deeper client relationships, track opportunities, and scale your solo business—all in one beautiful workspace." Update the CTA button to "Start Free Trial" and add a secondary button "Watch Demo". Replace the screenshot with a modern dashboard interface showing colorful metric cards, pipeline stages, and niche selection. Use Inter font family throughout and emerald green (#10b981) for primary button with orange (#f97316) for the secondary action.</design_instructions>
<references>src/components/blocks/heros/split-with-screenshot.tsx</references>
</edit_component>

<edit_component>
<file_path>src/components/blocks/feature-sections/bento-grid.tsx</file_path>
<design_instructions>Transform into a niche showcase section. Title should be "Built for Your Unique Business Model" with subtitle "Every niche has different needs. Our CRM adapts to how you actually work." Create 4 main bento grid items showcasing different niches: 1) Creator Dashboard with content pipeline stages, follower metrics, and brand collaboration tracking, 2) Coach Interface showing client progress, session scheduling, and program management, 3) Podcaster View with episode planning, guest outreach, and sponsor tracking, 4) Freelancer Setup displaying project pipelines, client communication, and invoice tracking. Use vibrant accent colors and include mock UI elements for each niche.</design_instructions>
<references>src/components/blocks/feature-sections/bento-grid.tsx</references>
</edit_component>

<edit_component>
<file_path>src/components/blocks/feature-sections/simple-three-column-with-large-icons.tsx</file_path>
<design_instructions>Create a core features section with title "Everything You Need to Scale" and three key features: 1) "Drag & Drop Pipelines" - Customize your 10-stage pipeline for each niche with visual pipeline builder icon, 2) "Smart Analytics" - Get insights that matter to your business model with analytics dashboard icon, 3) "Seamless Calendar" - Never miss a deadline or client call with integrated scheduling with calendar icon. Use emerald and orange accent colors for icons and maintain clean, professional styling with Inter typography.</design_instructions>
<references>src/components/blocks/feature-sections/simple-three-column-with-large-icons.tsx</references>
</edit_component>

<edit_component>
<file_path>src/components/blocks/pricing/three-tiers-with-emphasized-tier.tsx</file_path>
<design_instructions>Create pricing for the CRM platform with three tiers: "Starter" at $19/month (1 niche, 500 contacts, basic analytics, email support), "Professional" at $39/month (3 niches, 2,000 contacts, advanced analytics, priority support, custom fields) - this tier should be emphasized, and "Enterprise" at $79/month (unlimited niches, unlimited contacts, white-label options, dedicated support, API access). Use emerald green for the emphasized tier and include "14-day free trial" messaging. Add feature comparisons relevant to creator businesses like "Pipeline customization", "Niche templates", "Client portal access".</design_instructions>
<references>src/components/blocks/pricing/three-tiers-with-emphasized-tier.tsx</references>
</edit_component>

<edit_component>
<file_path>src/components/blocks/testimonials/testimonials-grid-with-centered-carousel.tsx</file_path>
<design_instructions>Update testimonials for creator/freelancer focus. Include testimonials like: "Finally, a CRM that understands my coaching business. The client journey mapping is perfect." - Sarah Chen, Life Coach. "Managing podcast guests and sponsors has never been easier. The pipeline keeps everything organized." - Marcus Rivera, Tech Podcast Host. "As a content creator, I love how it tracks brand collaborations and content performance in one place." - Alex Kim, YouTuber. Use professional headshots and include their business types/niches underneath names.</design_instructions>
<references>src/components/blocks/testimonials/testimonials-grid-with-centered-carousel.tsx</references>
</edit_component>

<edit_component>
<file_path>src/components/blocks/ctas/simple-centered-with-gradient.tsx</file_path>
<design_instructions>Create final CTA section with heading "Ready to Transform Your Business?" and subtext "Join thousands of creators, coaches, and freelancers who've streamlined their client relationships." Primary button "Start Your Free Trial" in emerald, secondary button "Schedule a Demo" in orange. Use a subtle gradient background with the emerald and orange colors and maintain the clean, professional aesthetic.</design_instructions>
<references>src/components/blocks/ctas/simple-centered-with-gradient.tsx</references>
</edit_component>

<edit_component>
<file_path>src/components/blocks/footers/footer-with-grid.tsx</file_path>
<design_instructions>Create footer with company branding for "NicheCRM" and organize links into: Product (Features, Pricing, Integrations, API), Resources (Help Center, Blog, Templates, Webinars), Company (About, Careers, Contact, Privacy), and Niches (Creators, Coaches, Podcasters, Freelancers). Include social media links and copyright. Use clean gray (#64748b) text on white background with emerald accent for company name.</design_instructions>
<references>src/components/blocks/footers/footer-with-grid.tsx</references>
</edit_component>

<create_component>
<file_path>src/components/app/sidebar-navigation.tsx</file_path>
<design_instructions>Create a collapsible sidebar navigation component with a clean, modern design. Include a top logo area with "NicheCRM" branding and collapse/expand toggle. Navigation items: Dashboard, CRM, Calendar, Analytics, and Programs (with dynamic labeling based on niche). Add a niche selector dropdown showing current active niche with options to switch or add new niches (Creator, Coach, Podcaster, Freelancer). Include user profile section at bottom with settings and logout options. Use emerald green for active states and subtle hover effects. The sidebar should be 280px when expanded and 60px when collapsed, with smooth transitions.</design_instructions>
</create_component>

<create_component>
<file_path>src/components/app/dashboard-overview.tsx</file_path>
<design_instructions>Create a comprehensive dashboard component with a grid layout of metric cards tailored to the active niche. Include a header with niche selector, time period filter, and "Add Metric" button. Display 6-8 metric cards in a responsive grid showing key KPIs like "Active Opportunities", "Revenue This Month", "Clients Added", "Conversion Rate", etc. Each card should have a title, large number, percentage change indicator (green/red), and a small trend chart. Add a "Recent Activity" section below with a timeline of recent CRM actions. Include quick action buttons for "Add Opportunity", "Schedule Meeting", "Create Task". Use vibrant colors with emerald and orange accents, clean white cards with subtle shadows, and Inter typography throughout.</design_instructions>
</create_component>

<create_component>
<file_path>src/components/app/crm-pipeline-view.tsx</file_path>
<design_instructions>Create a Kanban-style pipeline interface with 10 customizable stages. Header includes pipeline name, niche context, filters (date range, assignee, value), search, and "Add Opportunity" button. The pipeline shows columns for each stage with opportunity cards that can be dragged between stages. Each opportunity card displays client name, deal value, probability, next action, and quick edit button. Include a pipeline editor mode triggered by "Edit Pipeline" that allows renaming stages, reordering, and adding/removing stages with drag-and-drop. Add bulk actions toolbar when multiple cards are selected. Use monday.com-style visual design with colorful stage headers (different color per stage), clean white cards with subtle shadows, and smooth drag animations. Include empty states with helpful CTAs for new users.</design_instructions>
</create_component>

<create_component>
<file_path>src/components/app/opportunity-modal.tsx</file_path>
<design_instructions>Create a comprehensive modal for creating/editing opportunities with multiple tabs: Overview (client name, deal value, probability, stage, assigned user, due date), Details (custom fields based on niche like "Content Type" for creators or "Coaching Package" for coaches), Activity (timeline of interactions, notes, emails, calls), and Files (document attachments). Include rich text editor for notes, tag system for categorization, and reminder/task creation. The modal should be responsive, use clean form design with proper validation, and include save/cancel actions. Use emerald green for save button and maintain consistent styling with the overall app design.</design_instructions>
</create_component>

<create_component>
<file_path>src/components/app/niche-onboarding.tsx</file_path>
<design_instructions>Create a multi-step onboarding flow for niche selection. Step 1: Welcome screen with platform introduction. Step 2: Niche selection with large, visually appealing cards for Creator, Coach, Podcaster, Freelancer - each with relevant icons, descriptions, and example use cases. Step 3: Pipeline customization where users can modify the 10 default stages for their chosen niche. Step 4: Import options (CSV, integrations, manual entry) with templates. Step 5: Workspace setup with team member invitations. Include progress indicator, back/next navigation, and "Skip for now" options. Use vibrant colors, engaging illustrations, and clear typography to make onboarding feel welcoming and professional.</design_instructions>
</create_component>

</components>