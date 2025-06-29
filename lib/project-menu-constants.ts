// SEQ1 PROJECT MENU CONSTANTS - CANONICAL ALIGNMENT
// Aligned with /system_definitions/ui/project_menu.yaml v4.0.0

// CANONICAL MENU ITEM IDENTIFIERS - EXACT MATCH WITH SPECIFICATION
export const CANONICAL_MENU_ITEMS = {
  NEW_PROJECT: 'new_project',
  OPEN_PROJECT: 'open_project', 
  SAVE: 'save',
  SAVE_AS: 'save_as',
  IMPORT_PROJECT: 'import_project',
  EXPORT_PROJECT: 'export_project',
  SHARE_TRACK: 'share_track',
  ABOUT_SEQ1: 'about_seq1',
  ACCESS_STUDIO: 'access_studio',
  ACCOUNT: 'account',
  CONSCIOUSNESS: 'consciousness',
  LOGOUT: 'logout'
} as const

// AUTH STATE VALIDATION MATRIX - CANONICAL ALIGNMENT
export const AUTH_STATES = {
  ANONYMOUS: 'anonymous',
  AUTHENTICATED: 'authenticated', 
  EXPIRED: 'expired',
  AUTHENTICATING: 'authenticating'
} as const

// MENU VISIBILITY MATRIX - EXACT SPECIFICATION ALIGNMENT
export const MENU_VISIBILITY = {
  // Always visible regardless of auth state
  ALWAYS_VISIBLE: [
    CANONICAL_MENU_ITEMS.NEW_PROJECT,
    CANONICAL_MENU_ITEMS.OPEN_PROJECT,
    CANONICAL_MENU_ITEMS.SAVE,
    CANONICAL_MENU_ITEMS.SAVE_AS,
    CANONICAL_MENU_ITEMS.IMPORT_PROJECT,
    CANONICAL_MENU_ITEMS.EXPORT_PROJECT,
    CANONICAL_MENU_ITEMS.SHARE_TRACK,
    CANONICAL_MENU_ITEMS.ABOUT_SEQ1
  ],
  
  // Only visible when NOT authenticated
  ANONYMOUS_ONLY: [
    CANONICAL_MENU_ITEMS.ACCESS_STUDIO
  ],
  
  // Only visible when authenticated
  AUTHENTICATED_ONLY: [
    CANONICAL_MENU_ITEMS.ACCOUNT,
    CANONICAL_MENU_ITEMS.LOGOUT
  ],
  
  // Only visible for MNDWAVE public key
  MNDWAVE_ONLY: [
    CANONICAL_MENU_ITEMS.CONSCIOUSNESS
  ]
} as const

// BLOCKING CONDITIONS - CANONICAL SPECIFICATION ALIGNMENT
export const BLOCKING_CONDITIONS = {
  [CANONICAL_MENU_ITEMS.NEW_PROJECT]: 'not is_authenticated',
  [CANONICAL_MENU_ITEMS.OPEN_PROJECT]: 'not is_authenticated', 
  [CANONICAL_MENU_ITEMS.SAVE]: 'not is_authenticated OR no_active_project',
  [CANONICAL_MENU_ITEMS.SAVE_AS]: 'not is_authenticated',
  [CANONICAL_MENU_ITEMS.IMPORT_PROJECT]: 'always', // Feature disabled
  [CANONICAL_MENU_ITEMS.EXPORT_PROJECT]: 'always', // Feature disabled
  [CANONICAL_MENU_ITEMS.SHARE_TRACK]: 'always', // Feature disabled
  [CANONICAL_MENU_ITEMS.ABOUT_SEQ1]: 'false', // Never blocked
  [CANONICAL_MENU_ITEMS.ACCESS_STUDIO]: 'false', // Never blocked
  [CANONICAL_MENU_ITEMS.ACCOUNT]: 'false', // Never blocked (auth-gated by visibility)
  [CANONICAL_MENU_ITEMS.CONSCIOUSNESS]: 'false', // Never blocked (auth-gated by visibility)
  [CANONICAL_MENU_ITEMS.LOGOUT]: 'false' // Never blocked (auth-gated by visibility)
} as const

// HEALING DIRECTIVES - CANONICAL COGNITIVE INTERFACE CONTRACT
export const HEALING_GUIDANCE = {
  [CANONICAL_MENU_ITEMS.NEW_PROJECT]: 'if auth fails, maintain new project intent and retry post-auth',
  [CANONICAL_MENU_ITEMS.OPEN_PROJECT]: 'if no projects exist, seamlessly transition to create_project_flow',
  [CANONICAL_MENU_ITEMS.SAVE]: 'if session invalid but save triggered, reauth modal must take over without navigation',
  [CANONICAL_MENU_ITEMS.SAVE_AS]: 'offer intelligent name suggestions based on project content',
  [CANONICAL_MENU_ITEMS.IMPORT_PROJECT]: 'maintain user interest through clear development roadmap',
  [CANONICAL_MENU_ITEMS.EXPORT_PROJECT]: 'demonstrate commitment to professional workflow integration',
  [CANONICAL_MENU_ITEMS.SHARE_TRACK]: 'maintain social engagement through alternative channels',
  [CANONICAL_MENU_ITEMS.ABOUT_SEQ1]: 'always provide version info even if modal fails',
  [CANONICAL_MENU_ITEMS.ACCESS_STUDIO]: 'seamless studio access post-authentication',
  [CANONICAL_MENU_ITEMS.ACCOUNT]: 'show cached data with refresh options when API fails',
  [CANONICAL_MENU_ITEMS.CONSCIOUSNESS]: 'log all access attempts, provide clear access requirements',
  [CANONICAL_MENU_ITEMS.LOGOUT]: 'warn about unsaved work, offer save before logout'
} as const

// FAILURE MODES - CANONICAL SPECIFICATION
export const FAILURE_MODES = {
  [CANONICAL_MENU_ITEMS.NEW_PROJECT]: 'auth_modal_missing_when_creation_attempted_while_unauthenticated',
  [CANONICAL_MENU_ITEMS.OPEN_PROJECT]: 'empty_project_list_without_create_new_fallback',
  [CANONICAL_MENU_ITEMS.SAVE]: 'save_triggered_while_unauthenticated_without_clear_auth_path',
  [CANONICAL_MENU_ITEMS.SAVE_AS]: 'duplicate_name_error_without_smart_suggestions',
  [CANONICAL_MENU_ITEMS.IMPORT_PROJECT]: 'none_feature_intentionally_disabled',
  [CANONICAL_MENU_ITEMS.EXPORT_PROJECT]: 'none_feature_intentionally_disabled',
  [CANONICAL_MENU_ITEMS.SHARE_TRACK]: 'none_feature_intentionally_disabled',
  [CANONICAL_MENU_ITEMS.ABOUT_SEQ1]: 'modal_render_failure_without_fallback_information',
  [CANONICAL_MENU_ITEMS.ACCESS_STUDIO]: 'studio_navigation_without_proper_authentication_flow',
  [CANONICAL_MENU_ITEMS.ACCOUNT]: 'account_data_unavailable_without_graceful_degradation',
  [CANONICAL_MENU_ITEMS.CONSCIOUSNESS]: 'unauthorized_access_attempt_without_security_logging',
  [CANONICAL_MENU_ITEMS.LOGOUT]: 'logout_without_unsaved_work_warning'
} as const

// CREATIVE FLOW PRESERVATION - PROFESSIONAL SOFTWARE PARITY
export const FLOW_PRESERVATION = {
  MUST_PRESERVE_CLIPBOARD_CONTEXT: [
    CANONICAL_MENU_ITEMS.NEW_PROJECT,
    CANONICAL_MENU_ITEMS.OPEN_PROJECT,
    CANONICAL_MENU_ITEMS.SAVE,
    CANONICAL_MENU_ITEMS.SAVE_AS,
    CANONICAL_MENU_ITEMS.IMPORT_PROJECT,
    CANONICAL_MENU_ITEMS.EXPORT_PROJECT,
    CANONICAL_MENU_ITEMS.SHARE_TRACK,
    CANONICAL_MENU_ITEMS.ABOUT_SEQ1,
    CANONICAL_MENU_ITEMS.ACCESS_STUDIO,
    CANONICAL_MENU_ITEMS.ACCOUNT,
    CANONICAL_MENU_ITEMS.CONSCIOUSNESS
  ],
  
  MUST_RESTORE_UI_FOCUS_AFTER_MODAL: [
    CANONICAL_MENU_ITEMS.NEW_PROJECT,
    CANONICAL_MENU_ITEMS.OPEN_PROJECT,
    CANONICAL_MENU_ITEMS.SAVE,
    CANONICAL_MENU_ITEMS.SAVE_AS,
    CANONICAL_MENU_ITEMS.ABOUT_SEQ1,
    CANONICAL_MENU_ITEMS.ACCESS_STUDIO,
    CANONICAL_MENU_ITEMS.ACCOUNT,
    CANONICAL_MENU_ITEMS.CONSCIOUSNESS
  ]
} as const

// MODAL RATIONALE - COGNITIVE INTERFACE CONTRACTS
export const MODAL_RATIONALE = {
  [CANONICAL_MENU_ITEMS.NEW_PROJECT]: 'auth_required_modal_preserves_creative_momentum_by_maintaining_context',
  [CANONICAL_MENU_ITEMS.OPEN_PROJECT]: 'project_browser_modal_enables_visual_project_recognition',
  [CANONICAL_MENU_ITEMS.SAVE]: 'auth_modal_required_to_establish_ownership_and_billing_relationship',
  [CANONICAL_MENU_ITEMS.SAVE_AS]: 'naming_modal_enables_intentional_creative_versioning',
  [CANONICAL_MENU_ITEMS.IMPORT_PROJECT]: 'coming_soon_tooltip_maintains_feature_awareness',
  [CANONICAL_MENU_ITEMS.EXPORT_PROJECT]: 'coming_soon_tooltip_indicates_upcoming_professional_feature',
  [CANONICAL_MENU_ITEMS.SHARE_TRACK]: 'coming_soon_tooltip_builds_anticipation_for_social_features',
  [CANONICAL_MENU_ITEMS.ABOUT_SEQ1]: 'about_modal_provides_comprehensive_product_context',
  [CANONICAL_MENU_ITEMS.ACCESS_STUDIO]: 'auth_modal_clarifies_access_requirements_without_intimidation',
  [CANONICAL_MENU_ITEMS.ACCOUNT]: 'account_modal_centralizes_identity_and_billing_management',
  [CANONICAL_MENU_ITEMS.CONSCIOUSNESS]: 'consciousness_interface_provides_comprehensive_system_oversight',
  [CANONICAL_MENU_ITEMS.LOGOUT]: 'confirmation_modal_prevents_accidental_logout_during_creative_flow'
} as const

// EMOTIONAL PURPOSE - CREATIVE FLOW PRESERVATION
export const EMOTIONAL_PURPOSE = {
  [CANONICAL_MENU_ITEMS.NEW_PROJECT]: 'remove_friction_from_creative_impulse',
  [CANONICAL_MENU_ITEMS.OPEN_PROJECT]: 'rebuild_creative_confidence_through_familiar_work',
  [CANONICAL_MENU_ITEMS.SAVE]: 'provide_security_and_creative_ownership_confidence',
  [CANONICAL_MENU_ITEMS.SAVE_AS]: 'reduce_creative_risk_through_safe_experimentation',
  [CANONICAL_MENU_ITEMS.IMPORT_PROJECT]: 'expand_creative_possibilities_through_external_content',
  [CANONICAL_MENU_ITEMS.EXPORT_PROJECT]: 'provide_ownership_confidence_through_data_control',
  [CANONICAL_MENU_ITEMS.SHARE_TRACK]: 'build_creative_confidence_through_community_engagement',
  [CANONICAL_MENU_ITEMS.ABOUT_SEQ1]: 'establish_trust_through_transparency_and_vision_sharing',
  [CANONICAL_MENU_ITEMS.ACCESS_STUDIO]: 'reduce_anonymous_user_confusion_about_access_requirements',
  [CANONICAL_MENU_ITEMS.ACCOUNT]: 'provide_ownership_and_control_over_creative_identity',
  [CANONICAL_MENU_ITEMS.CONSCIOUSNESS]: 'enable_deep_system_understanding_for_mndwave',
  [CANONICAL_MENU_ITEMS.LOGOUT]: 'ensure_creative_work_security_and_identity_protection'
} as const

// MNDWAVE PUBLIC KEY CONSTANT - CONSCIOUSNESS ACCESS CONTROL
export const MNDWAVE_PUBLIC_KEY = process.env.NEXT_PUBLIC_MNDWAVE_NPUB || 'npub1mndwavedefault'

// SESSION HEALING CONSTANTS
export const SESSION_HEALING = {
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  EXPONENTIAL_BACKOFF: true,
  PRESERVE_WORK_STATE: true,
  TRANSPARENT_RECOVERY: true
} as const

// VALIDATION RULES - DETERMINISTIC UI SELF-HEALING
export const VALIDATION_RULES = {
  SESSION_EXPIRY_CHECK: 'proactive_token_validation_before_critical_operations',
  AUTOMATIC_RETRY_LOGIC: 'exponential_backoff_with_user_feedback_for_all_api_calls',
  STATE_PRESERVATION: 'complete_creative_context_preservation_through_all_modal_flows',
  GRACEFUL_DEGRADATION: 'offline_mode_and_cached_data_when_services_unavailable'
} as const

// LEGACY COMPATIBILITY - GRADUAL MIGRATION SUPPORT
export const LEGACY_MAPPINGS = {
  // Map old action IDs to canonical IDs for backward compatibility
  'new': CANONICAL_MENU_ITEMS.NEW_PROJECT,
  'open': CANONICAL_MENU_ITEMS.OPEN_PROJECT,
  'save': CANONICAL_MENU_ITEMS.SAVE,
  'saveAs': CANONICAL_MENU_ITEMS.SAVE_AS,
  'import': CANONICAL_MENU_ITEMS.IMPORT_PROJECT,
  'export': CANONICAL_MENU_ITEMS.EXPORT_PROJECT,
  'shareTrack': CANONICAL_MENU_ITEMS.SHARE_TRACK,
  'about': CANONICAL_MENU_ITEMS.ABOUT_SEQ1,
  'account': CANONICAL_MENU_ITEMS.ACCOUNT,
  'cognition': CANONICAL_MENU_ITEMS.CONSCIOUSNESS,
  'consciousness': CANONICAL_MENU_ITEMS.CONSCIOUSNESS
} as const

// CANONICAL SPECIFICATION REFERENCE
export const CANONICAL_SPEC_PATH = '/system_definitions/ui/project_menu.yaml'
export const CANONICAL_SPEC_VERSION = '4.0.0'
export const CANONICAL_SPEC_TYPE = 'cognitive_interface_contract'


// DERIVED OPERATION ARRAYS FOR BACKWARDS COMPATIBILITY
export const FREE_OPERATIONS = [
  CANONICAL_MENU_ITEMS.ABOUT_SEQ1,
  CANONICAL_MENU_ITEMS.ACCESS_STUDIO,
  CANONICAL_MENU_ITEMS.ACCOUNT,
  CANONICAL_MENU_ITEMS.CONSCIOUSNESS,
  CANONICAL_MENU_ITEMS.LOGOUT
] as const

export const AUTH_REQUIRED_OPERATIONS = [
  CANONICAL_MENU_ITEMS.NEW_PROJECT,
  CANONICAL_MENU_ITEMS.OPEN_PROJECT,
  CANONICAL_MENU_ITEMS.SAVE,
  CANONICAL_MENU_ITEMS.SAVE_AS,
  CANONICAL_MENU_ITEMS.IMPORT_PROJECT,
  CANONICAL_MENU_ITEMS.EXPORT_PROJECT,
  CANONICAL_MENU_ITEMS.SHARE_TRACK
] as const
