# Data Sources and Data Quality

## College Data

### Sources
- Government education portals
- University websites
- NAAC accreditation data
- State education boards

### Data Quality Standards

#### Required Fields
- **college_name**: Must be non-null, non-empty string (trimmed)
- **state**: Defaults to 'Unknown' if not provided

#### Optional Fields (with validation)
- **district**: Must be non-empty if provided
- **location**: Can be empty string (default)
- **college_type**: Must be non-empty if provided
- **courses_offered**: Must be array (defaults to empty array)
- **website**: Must be valid URL if provided
- **rating**: Must be between 0-10 if provided
- **fees**: Must be positive number if provided

### Data Integrity Constraints

1. **CHECK Constraints**
   - `college_name_not_empty`: Ensures name is not null or whitespace-only
   - `state_not_empty`: Ensures state is not empty when provided
   - `district_not_empty`: Ensures district is not empty when provided

2. **Validation Trigger**
   - `validate_college_data()`: Automatically trims whitespace and validates data on insert/update
   - Sets empty strings to NULL for optional fields
   - Ensures courses_offered is always an array

3. **Active Status**
   - `is_active` boolean flag marks invalid records as inactive
   - Only active colleges are shown to regular users
   - Admins can view all colleges including inactive ones

### Data Cleanup Process

The migration automatically:
1. Marks colleges with NULL/empty names as inactive
2. Attempts to fix 'Unknown College' entries by using location data
3. Generates a data quality report showing:
   - Count of inactive colleges
   - Count of colleges with missing state/district
   - Count of colleges with no courses

### Manual Data Cleanup

To identify data quality issues:

```sql
-- Find colleges with minimal information
SELECT id, college_name, state, district, courses_offered
FROM colleges
WHERE is_active = true 
  AND (
    courses_offered IS NULL 
    OR array_length(courses_offered, 1) IS NULL
    OR district IS NULL
  );

-- Find colleges with suspicious names
SELECT id, college_name, state
FROM colleges
WHERE is_active = true
  AND (
    college_name ILIKE '%unknown%'
    OR college_name ILIKE '%test%'
    OR length(college_name) < 5
  );
```

To mark colleges as inactive:

```sql
UPDATE colleges 
SET is_active = false 
WHERE id = '<college-id>';
```

To reactivate after fixing data:

```sql
UPDATE colleges 
SET is_active = true, 
    college_name = 'Fixed Name',
    district = 'Fixed District'
WHERE id = '<college-id>';
```

## Scholarship Data

### Sources
- National Scholarship Portal
- State scholarship schemes
- Private organization scholarships
- University scholarships

### Verification Status
All scholarships go through verification before being marked as `verified = true`.

## Career Data

### Sources
- Job portals (Indeed, Naukri, LinkedIn)
- Company career pages
- Government job postings

### Data Refresh
Career data is automatically refreshed weekly via the `refresh-data` edge function.

## Data Update Schedule

- **Colleges**: Manual updates by admins, validated on insert/update
- **Scholarships**: Weekly refresh via edge function
- **Careers**: Weekly refresh via edge function
- **Jobs**: Daily refresh for active postings

## Data Quality Monitoring

### Key Metrics
1. Percentage of colleges with complete information
2. Number of inactive/invalid records
3. Data freshness (last_updated timestamps)
4. User-reported issues (via feedback system)

### Error Reporting
Users and admins should report data quality issues through:
1. Admin dashboard feedback
2. Direct database queries to identify patterns
3. Application error logs
