DESCRIPTION Fail-open rate by project over a time range

SELECT
    projectId,
    countIf(
        JSONExtractBool(metadata, 'orchestrationFailOpen') = 1
    ) AS failOpenCount,
    count() AS totalOrchestrations
FROM spans
WHERE
    projectId = {projectId: String}
    AND createdAt >= date_sub(DAY, {days: UInt32}, now())
    AND metadata != ''
    AND JSONHas(metadata, 'orchestrationFailOpen')
GROUP BY projectId
