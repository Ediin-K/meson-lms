/**
 * Meson LMS — legal document version (keep in sync with backend `termsVersion` / DB).
 * Content is informational and user-friendly; institutions should have counsel review.
 * References: Kosovo Law 06/L-082 on Personal Data Protection; GDPR-aligned practices.
 */

export const LEGAL_DOCUMENT_VERSION = '2026.04.05'

/** @typedef {{ id: string, heading: string, paragraphs: string[] }} LegalSection */

/** @type {{ title: string, subtitle: string, sections: LegalSection[] }} */
export const PRIVACY_POLICY = {
  title: 'Privacy Policy',
  subtitle: `Meson Learning Management System — Version ${LEGAL_DOCUMENT_VERSION}`,
  sections: [
    {
      id: 'intro',
      heading: 'Who we are',
      paragraphs: [
        'Meson (“Meson”, “we”, “us”) is a learning management system (LMS) operated for educational institutions, instructors, students, and parents or guardians. This Privacy Policy explains how we collect, use, store, and protect personal data when you use the Meson platform and related services.',
        'We aim to comply with the Law No. 06/L-082 on Personal Data Protection of the Republic of Kosovo and to follow the core principles of the EU General Data Protection Regulation (GDPR), including lawfulness, fairness, transparency, purpose limitation, data minimisation, accuracy, storage limitation, integrity, confidentiality, and accountability.',
        'Your school or organisation may act as a separate “data controller” for some processing activities. Where that applies, Meson typically acts as a “processor” under their instructions. This policy describes processing in both scenarios in plain language.',
      ],
    },
    {
      id: 'data-we-collect',
      heading: 'What personal data we collect',
      paragraphs: [
        'We collect only what is reasonably needed to provide educational services:',
        '• Identity & account: first and last name, email address, role (e.g. student, instructor, parent), institution affiliation where applicable, and account credentials (stored using secure hashing; we do not store plain-text passwords).',
        '• Learning activity: course enrolments, lesson progress, assignment submissions, grades, feedback, messages within the platform, and timestamps of certain actions (e.g. login, submission).',
        '• Technical data: IP address, browser type, device type, and cookies or similar technologies used for security, preferences, and basic analytics (see “Cookies”).',
        '• Communications: content you send through support channels or in-app messaging, where enabled.',
        'We do not require sensitive categories of data (such as health data) unless your institution explicitly collects them under a separate lawful basis and notice.',
      ],
    },
    {
      id: 'how-we-use',
      heading: 'How we use your data',
      paragraphs: [
        'We use personal data to:',
        '• Create and manage accounts; authenticate users and protect the platform.',
        '• Deliver courses, assignments, assessments, grades, and notifications related to learning.',
        '• Allow instructors and authorised staff to manage classes and evaluate work.',
        '• Allow parents/guardians to view permitted information about a learner, where the institution enables this.',
        '• Improve reliability, security, and usability; diagnose errors; and prevent fraud or abuse.',
        '• Comply with legal obligations and enforce our Terms of Service.',
        'We do not sell your personal data. We do not use student data for behavioural advertising unrelated to the educational purpose without clear consent and a lawful basis.',
      ],
    },
    {
      id: 'security',
      heading: 'How we store and protect data',
      paragraphs: [
        'We apply technical and organisational measures appropriate to the risk, including encryption in transit (HTTPS), access controls, separation of environments where possible, secure password handling, logging and monitoring, and staff training on confidentiality.',
        'No online service can guarantee absolute security. If we become aware of an incident that affects your data, we will notify affected users and, where required, supervisory authorities, in line with applicable law.',
        'Data may be stored on servers located in the European Economic Area or in jurisdictions that provide adequate safeguards (e.g. standard contractual clauses) where cross-border transfer is necessary.',
      ],
    },
    {
      id: 'sharing',
      heading: 'Sharing with third parties',
      paragraphs: [
        'We may share data only when necessary:',
        '• With your educational institution, as part of providing the service they requested.',
        '• With subprocessors (e.g. hosting, email delivery, analytics configured for privacy) under contracts that require protection of personal data.',
        '• When required by law, court order, or competent authority.',
        '• To protect the rights, safety, and security of users, Meson, or the public.',
        'We require third parties to use data only for the purposes we specify and to apply appropriate safeguards.',
      ],
    },
    {
      id: 'rights',
      heading: 'Your rights',
      paragraphs: [
        'Depending on applicable law, you may have the right to:',
        '• Access the personal data we hold about you.',
        '• Rectify inaccurate or incomplete data.',
        '• Request erasure (“right to be forgotten”) where applicable, subject to legitimate retention needs (e.g. academic records required by the institution).',
        '• Restrict or object to certain processing.',
        '• Data portability, where technically feasible.',
        '• Withdraw consent where processing is based on consent, without affecting prior lawful processing.',
        '• Lodge a complaint with a supervisory authority (in Kosovo, the relevant authority responsible for personal data protection).',
        'To exercise your rights, contact us using the details below. We may need to verify your identity. If your institution is the controller for certain data, we may direct you to them for specific requests.',
      ],
    },
    {
      id: 'cookies',
      heading: 'Cookies and similar technologies',
      paragraphs: [
        'We use essential cookies (or local storage) to keep you signed in, remember preferences such as language or theme, and protect against cross-site request forgery.',
        'Optional analytics cookies, if used, will be described in a cookie notice and, where required, activated only after your consent.',
        'You can control cookies through your browser settings; disabling essential cookies may affect how Meson works.',
      ],
    },
    {
      id: 'children',
      heading: 'Children and students',
      paragraphs: [
        'Meson is intended for use in educational contexts. Where users are minors, the institution or parent/guardian is typically responsible for consent and supervision, in line with local law. We encourage schools to obtain appropriate authorisations before creating accounts for children.',
      ],
    },
    {
      id: 'retention',
      heading: 'Retention',
      paragraphs: [
        'We retain personal data only as long as necessary for the purposes above, including to meet legal, contractual, or academic record-keeping requirements of your institution. When data is no longer needed, we delete or anonymise it in line with our retention schedule.',
      ],
    },
    {
      id: 'changes',
      heading: 'Changes to this policy',
      paragraphs: [
        'We may update this Privacy Policy from time to time. We will post the new version in the application and update the version date. Material changes may require additional notice or consent where the law requires.',
      ],
    },
    {
      id: 'contact',
      heading: 'Contact (privacy)',
      paragraphs: [
        'For privacy questions or requests: contact your institution’s Meson administrator in the first instance, or email Meson at privacy@meson.example (replace with your production address).',
        'Data controller (where Meson operates as controller): [Legal entity name and address — to be completed by the operator].',
      ],
    },
  ],
}

/** @type {{ title: string, subtitle: string, sections: LegalSection[] }} */
export const TERMS_OF_SERVICE = {
  title: 'Terms of Service',
  subtitle: `Meson Learning Management System — Version ${LEGAL_DOCUMENT_VERSION}`,
  sections: [
    {
      id: 'acceptance',
      heading: 'Acceptance of terms',
      paragraphs: [
        'By creating an account or using Meson, you agree to these Terms of Service and our Privacy Policy. If you do not agree, do not use the platform.',
        'If you use Meson on behalf of an institution, you also agree to follow that institution’s policies. Where these Terms conflict with a binding agreement between Meson and your institution, the agreement with the institution may prevail for institutional users.',
      ],
    },
    {
      id: 'description',
      heading: 'The service',
      paragraphs: [
        'Meson provides tools for online learning: courses, content, assignments, grading, communication features, and related administration. Features may change as we improve the product. We strive for high availability but do not guarantee uninterrupted access.',
      ],
    },
    {
      id: 'accounts',
      heading: 'Accounts and security',
      paragraphs: [
        'You must provide accurate registration information and keep your credentials confidential. You are responsible for activity under your account. Notify your administrator or Meson support immediately if you suspect unauthorised access.',
        'You must not share accounts in a way that violates institutional rules or compromises assessment integrity.',
      ],
    },
    {
      id: 'students-instructors',
      heading: 'Rules for students and instructors',
      paragraphs: [
        'Students: complete work honestly; respect deadlines and instructions; treat peers and staff respectfully in messages and forums; do not upload malware or harmful content.',
        'Instructors: use the platform professionally; protect student privacy; grade and provide feedback fairly; comply with your institution’s academic policies.',
        'Parents/guardians (where enabled): use access only for permitted purposes and do not misuse information about other learners.',
      ],
    },
    {
      id: 'prohibited',
      heading: 'Prohibited conduct',
      paragraphs: [
        'You must not:',
        '• Cheat, plagiarise, impersonate another person, or assist others to cheat.',
        '• Attempt to gain unauthorised access to Meson, other users’ data, or connected systems.',
        '• Harass, threaten, discriminate, or post unlawful, hateful, or sexually explicit content.',
        '• Reverse engineer, scrape, or overload the service except as allowed by law.',
        '• Use Meson for non-educational commercial spam or illegal activities.',
        'Violations may lead to content removal, suspension, or termination, and may be reported to your institution.',
      ],
    },
    {
      id: 'content',
      heading: 'Content and intellectual property',
      paragraphs: [
        'Your institution or instructors typically own course materials. You retain rights in content you create, subject to licences you or your institution grant to use the platform. You must not upload content you do not have the right to use.',
        'Meson may display aggregated, non-personal statistics to improve the service.',
      ],
    },
    {
      id: 'disclaimer',
      heading: 'Disclaimer and limitation of liability',
      paragraphs: [
        'Meson is provided “as is” to the extent permitted by law. We disclaim implied warranties where allowed. We are not liable for indirect or consequential damages except where such limitation is prohibited by applicable law.',
        'Our total liability for claims arising from these Terms is limited to the amount you paid Meson for the service in the twelve months before the claim (if any fees apply); for free institutional deployments, liability may be further limited as agreed with the institution.',
        'Nothing in these Terms excludes liability for death, personal injury caused by negligence, fraud, or other liability that cannot be excluded under the laws of the Republic of Kosovo.',
      ],
    },
    {
      id: 'suspension',
      heading: 'Suspension and termination',
      paragraphs: [
        'We or your institution may suspend or terminate access for breach of these Terms, legal requirements, or risk to the service. You may stop using Meson at any time. Provisions that by nature should survive (e.g. liability limits, intellectual property) will survive termination.',
      ],
    },
    {
      id: 'law',
      heading: 'Governing law and jurisdiction',
      paragraphs: [
        'These Terms are governed by the laws of the Republic of Kosovo, without regard to conflict-of-law rules that would apply another jurisdiction’s laws.',
        'Courts in Kosovo shall have exclusive jurisdiction over disputes arising from these Terms, subject to any mandatory rights you may have under consumer or employment law.',
      ],
    },
    {
      id: 'contact',
      heading: 'Contact',
      paragraphs: [
        'Questions about these Terms: contact your Meson administrator or legal@meson.example (replace with your production address).',
      ],
    },
  ],
}
