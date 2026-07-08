/* UN-SWAP 3.0 sub-requirements per Performance Indicator, curated from the
   "UN-SWAP 3.0 Performance Indicator Framework".

   Each fact:
     text  — the sub-requirement, phrased as a fact about the entity
     level — minimum rating at which it is satisfied:
             "AP" = Approaches requirements and above
             "ME" = Meets requirements and above
             "EX" = Exceeds requirements only
     mo    — (optional) matching key for the "missing options" data: entities
             rated Missing that reported this option are also counted.

   Cross-level logic applied: where the same sub-requirement appears verbatim
   at several levels it is listed once at the lowest level; where a higher
   level strengthens it (e.g. "result" → "transformative result"), the
   strengthened form is a separate fact at the higher level.

   PLEASE REVIEW — especially the level assignments and wording. Edit freely;
   this file is plain text and the site picks changes up on refresh. */

window.SWAP_REQUIREMENTS = {

  "PI1": [
    { level: "AP", text: "An intersectional gender analysis, incorporating sex-disaggregated data, is carried out throughout the strategic planning process" },
    { level: "AP", text: "At least one high-level result on gender equality and the empowerment of women, directly linked to SDG achievement, is included in the main strategic planning document or equivalent",
      mo: "At least one high-level result" },
    { level: "ME", text: "The high-level gender equality result included in the main strategic planning document is transformative" },
    { level: "ME", text: "Adequate human and financial resources for implementation of the gender-related high-level result(s) are allocated or described in the main strategic planning document and/or budget document" },
    { level: "EX", text: "Indicators in the strategic planning document and/or related results framework integrate a gender perspective" }
  ],

  "PI2": [
    { level: "AP", text: "Guidance on measuring and reporting gender-related SDG results — including an intersectional approach and sex-disaggregated data — is developed and provided by the Strategic Planning Unit or equivalent" },
    { level: "ME", text: "High-level transformative result(s) on gender equality, directly linked to SDG achievement, are reported to Governing Bodies or equivalent, systematically utilizing sex-disaggregated data" },
    { level: "EX", text: "Gender analysis informs the allocation of adequate resources for gender equality and the empowerment of women" }
  ],

  "PI3": [
    { level: "AP", text: "The entity has achieved, or is on track to achieve, its planned gender-related results contributing to SDG achievement" },
    { level: "ME", text: "The entity contributes to gender-related results through joint initiatives and/or joint programmes or equivalent" },
    { level: "EX", text: "The planned results achieved or on track are transformative results on gender equality and the empowerment of women" },
    { level: "EX", text: "The entity contributes to transformative gender-related results through joint initiatives and/or joint programmes" }
  ],

  "PI4": [
    { level: "AP", text: "Meets some of the UNEG gender-related norms and applies some of the standards in the 2024 UNEG Guidance on Integrating Human Rights and Gender Equality in Evaluation" },
    { level: "ME", text: "Meets the UNEG gender equality-related norms and standards" },
    { level: "ME", text: "Applies the 2024 UNEG Guidance on Integrating Human Rights and Gender Equality in Evaluation during all phases of the evaluation" },
    { level: "EX", text: "Conducts at least one evaluation assessing the entity's corporate performance on gender mainstreaming (or equivalent) every 5 years" }
  ],

  "PI5": [
    { level: "AP", text: "The internal audit risk universe considers risks and challenges related to gender equality, identified in consultation with the gender unit/focal point",
      mo: "risk universe" },
    { level: "AP", text: "The internal audit function regularly considers gender equality risks in individual engagements",
      mo: "individual engagements" },
    { level: "ME", text: "Within its risk-based cycle, the entity's gender equality strategy or policy has been appropriately assessed by internal audit or another robust independent mechanism" },
    { level: "EX", text: "Recurrent, high-risk gender equality findings are regularly reported by the internal audit function in its annual reports to the governing bodies" }
  ],

  "PI6": [
    { level: "AP", text: "Up-to-date gender equality policy/policies or equivalent in place",
      mo: "Up to date gender equality policy" },
    { level: "AP", text: "A costed action plan is in place",
      mo: "costed action plan" },
    { level: "ME", text: "Deliverables in the costed action plan have been achieved, or are on track, in line with the proposed implementation timeline" },
    { level: "ME", text: "Adequate resources are disbursed for implementation of the gender equality policy/policies" },
    { level: "EX", text: "The entity reports at least every two years / regularly to the Governing Bodies or equivalent on progress of the gender equality policies" }
  ],

  "PI7": [
    { level: "AP", text: "Gender equality and the empowerment of women is proactively promoted by senior leadership, both internally and publicly",
      mo: "proactively promoted" },
    { level: "AP", text: "A senior-level Gender Steering and Implementation Committee or equivalent enhances progress, learning and accountability",
      mo: "Steering and Implementation Committee" },
    { level: "ME", text: "The Head of the Gender Unit participates in senior management team meetings and/or has a direct reporting line to senior leadership" },
    { level: "EX", text: "The Head of the Gender Unit both participates in senior management team meetings and has a direct reporting line to senior leadership" }
  ],

  "PI8": [
    { level: "AP", text: "A system is in place to hold senior leadership accountable for entity performance against the gender equality policies",
      mo: "System in place to hold" },
    { level: "AP", text: "Knowledge or experience in gender equality is embedded as a desirable competency in new Job Descriptions / Terms of Reference and recruitment processes",
      mo: "Job Descriptions" },
    { level: "AP", text: "A requirement for a proven track record in gender equality is included in senior appointments",
      mo: "senior appointments" },
    { level: "ME", text: "Senior leadership are held accountable for entity performance against the gender equality policies" },
    { level: "ME", text: "A system of recognition rewards excellent work promoting gender equality and the empowerment of women" },
    { level: "EX", text: "Senior leadership acts on feedback on their gender-responsive leadership through recurring confidential staff surveys and/or 360-degree feedback mechanisms" }
  ],

  "PI9": [
    { level: "AP", text: "The four-point Gender Equality Marker (GEM) scale is applied through the entity's ERP system, in alignment with the CEB VII UN data standard" },
    { level: "ME", text: "Quality assurance for the application of the GEM is prioritized and supported through capacity building and guidance" },
    { level: "EX", text: "Quality-assured financial information based on the GEM is reported to governing bodies or the CEB" }
  ],

  "PI10": [
    { level: "AP", text: "A financial target for gender equality and the empowerment of women is set, with a plan developed to reach it" },
    { level: "ME", text: "The financial target for gender equality as a principal objective is met (GEM 3/2B)" },
    { level: "ME", text: "A financial and narrative report linking funding to specific gender-related results, with justification for GEM 0 activities, is developed" },
    { level: "EX", text: "The financial target for activities contributing significantly to gender equality is met (GEM 2/2A)" },
    { level: "EX", text: "The financial and narrative report linking funding to gender-related results is published" }
  ],

  "PI11": [
    { level: "AP", text: "Gender focal points at HQ, regional and/or country levels are appointed at P4+ (or equivalent NPO), have written terms of reference, adequate gender expertise, and at least 20% of their time allocated to the function" },
    { level: "ME", text: "Staffing standards, training and deployment preparation needed to support the entity's gender equality goals are established" },
    { level: "ME", text: "The gender department/unit is fully funded according to an agreed funding formula based on staffing standards and the entity mandate" },
    { level: "EX", text: "Gender focal points are appointed at P5+ and specific funds are allocated to support the gender architecture and focal point networking" },
    { level: "EX", text: "Effective use of a roster of specialized gender equality expertise is demonstrated" }
  ],

  "PI12": [
    { level: "AP", text: "Ongoing mandatory training on gender equality is provided for all levels of personnel at HQ, regional and country offices",
      mo: "mandatory training" },
    { level: "AP", text: "A capacity assessment in gender equality and the empowerment of women is carried out",
      mo: "capacity assessment" },
    { level: "AP", text: "A costed capacity development plan for gender equality skills and knowledge is developed",
      mo: "costed capacity development plan" },
    { level: "ME", text: "The costed entity-wide capacity development plan is implemented" },
    { level: "ME", text: "Capacity-building initiatives on gender equality are undertaken by personnel in specific roles and functions" },
    { level: "ME", text: "Unconscious bias training is rolled out, starting with senior leadership" },
    { level: "ME", text: "Gender-responsive leadership (GRL) training is undertaken by senior leadership" },
    { level: "EX", text: "The costed entity-wide capacity development plan is evaluated" },
    { level: "EX", text: "Effective use of gender equality skills and knowledge by personnel in specific roles is demonstrated" },
    { level: "EX", text: "Unconscious bias training is rolled out for all staff" },
    { level: "EX", text: "Effective application of gender-responsive leadership training by senior leadership is demonstrated" }
  ],

  "PI13": [
    { level: "AP", text: "The organizational culture fully supports the promotion of gender equality and the empowerment of women" },
    { level: "ME", text: "An internal gender and power analysis (or equivalent) of systems, structures, hierarchies and decision-making is conducted to identify and remove barriers to gender equality" },
    { level: "EX", text: "Agreed-upon recommendations from the internal power analysis are implemented" }
  ],

  "PI14": [
    { level: "AP", text: "An entity-wide annual PSEA Action Plan is developed and implemented or on track for implementation",
      mo: "PSEA Action Plan" },
    { level: "AP", text: "A process is in place to assess and manage risks on sexual harassment",
      mo: "assess and manage risks" },
    { level: "ME", text: "The annual PSEA Action Plan is based on a risk assessment and incorporates a victim-centered approach" },
    { level: "ME", text: "PSEA actions undertaken throughout the year are reported annually to the governing bodies or equivalent" },
    { level: "ME", text: "The entity has a focal point for PSEA" },
    { level: "ME", text: "Entity-level measures to prevent and respond to sexual harassment are developed, communicated to personnel, and implemented" },
    { level: "ME", text: "The entity reports annually on sexual harassment measures to its governing bodies, in accordance with applicable reporting requirements" },
    { level: "ME", text: "The entity has a focal point for sexual harassment appointed" },
    { level: "EX", text: "The PSEA Action Plan is adequately resourced and more than 80% of actions are implemented" },
    { level: "EX", text: "Information about PSEA is shared publicly" },
    { level: "EX", text: "The PSEA focal point role is formalized, or the entity has dedicated PSEA capacity/function" },
    { level: "EX", text: "Sexual harassment measures are integrated into a costed, time-bound action plan with more than 80% implemented" },
    { level: "EX", text: "Information on sexual harassment measures is shared publicly" },
    { level: "EX", text: "The SH focal point role is formalized, or the entity has dedicated SH capacity/function" },
    { level: "EX", text: "Tools, good practices and lessons learned on PSEA and SH are documented and shared to strengthen UN system organizational culture" }
  ],

  "PI15": [
    { level: "AP", text: "A plan is in place to achieve the equal representation of women at all professional and higher staff levels" },
    { level: "ME", text: "Equal representation of women is reached for all professional and higher staff levels" },
    { level: "EX", text: "Equal representation of women is reached for all staff levels" }
  ],

  "PI16": [
    { level: "AP", text: "Transformative change on gender equality is promoted through the entity's communication channels and products" },
    { level: "AP", text: "The knowledge management system is leveraged to share gender-related information and/or research internally and externally" },
    { level: "ME", text: "A gender perspective is mainstreamed in high-level reports and/or briefings, including UN Secretary-General reports as appropriate" },
    { level: "EX", text: "Lessons learnt and best practices on the effectiveness of knowledge management and communication for gender equality are captured and shared" }
  ],

  "PI17": [
    { level: "AP", text: "The entity participated systematically in inter-agency coordination mechanisms on gender equality and the empowerment of women",
      mo: "inter-agency coordination" },
    { level: "AP", text: "The entity undertakes a UN-SWAP peer review process at least once every 4 years",
      mo: "peer review" },
    { level: "ME", text: "The entity effectively mainstreamed a gender perspective into inter-agency coordination mechanisms" },
    { level: "ME", text: "Agreed-upon recommendations from the UN-SWAP peer review process are implemented" },
    { level: "EX", text: "The entity supports implementation of at least one UN-SWAP Performance Indicator in another entity" }
  ],

  "PI18": [
    { level: "AP", text: "Consultation systems with organizations promoting gender equality and/or women's and girls' rights are established, and/or the entity engages such organizations for their meaningful participation" },
    { level: "ME", text: "The entity regularly consults appropriate gender equality organizations through established consultation systems to inform programming and/or inter-governmental processes" },
    { level: "ME", text: "The entity regularly engages gender equality organizations for their meaningful participation in activities led or supported by UN entities" },
    { level: "EX", text: "Entity programming and/or inter-governmental processes are informed by organizations promoting gender equality and women's and girls' rights" },
    { level: "EX", text: "The entity contributes to enabling economic opportunities for women and girls and/or builds strategic partnerships with the private sector or philanthropy for gender equality" }
  ]
};
