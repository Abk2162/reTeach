-- Function to get form topic statistics
CREATE OR REPLACE FUNCTION get_form_topic_stats(form_uuid UUID)
RETURNS TABLE (
    topic_id UUID,
    topic_name TEXT,
    total_questions BIGINT,
    correct_answers BIGINT,
    accuracy_percentage DECIMAL(5,2),
    total_responses BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id AS topic_id,
        t.name AS topic_name,
        COUNT(DISTINCT r.question_id) AS total_questions,
        SUM(CASE WHEN r.is_correct THEN 1 ELSE 0 END) AS correct_answers,
        CASE 
            WHEN COUNT(r.id) > 0 THEN 
                ROUND((SUM(CASE WHEN r.is_correct THEN 1 ELSE 0 END)::DECIMAL / COUNT(r.id)::DECIMAL) * 100, 2)
            ELSE 0 
        END AS accuracy_percentage,
        COUNT(r.id) AS total_responses
    FROM topics t
    INNER JOIN questions q ON q.topic_id = t.id
    INNER JOIN form_questions fq ON fq.question_id = q.id
    LEFT JOIN responses r ON r.question_id = q.id AND r.form_id = form_uuid
    WHERE fq.form_id = form_uuid
    GROUP BY t.id, t.name
    ORDER BY t.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get overall form statistics
CREATE OR REPLACE FUNCTION get_form_stats(form_uuid UUID)
RETURNS TABLE (
    total_sessions BIGINT,
    total_responses BIGINT,
    average_score DECIMAL(5,2),
    completion_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT fs.id) AS total_sessions,
        COUNT(r.id) AS total_responses,
        COALESCE(AVG(fs.score_percentage), 0) AS average_score,
        CASE 
            WHEN COUNT(DISTINCT fs.id) > 0 THEN
                ROUND((COUNT(DISTINCT CASE WHEN fs.completed_at IS NOT NULL THEN fs.id END)::DECIMAL / COUNT(DISTINCT fs.id)::DECIMAL) * 100, 2)
            ELSE 0
        END AS completion_rate
    FROM forms f
    LEFT JOIN form_sessions fs ON fs.form_id = f.id
    LEFT JOIN responses r ON r.form_id = f.id
    WHERE f.id = form_uuid
    GROUP BY f.id;
END;
$$ LANGUAGE plpgsql;

-- Function to get student performance on a form
CREATE OR REPLACE FUNCTION get_student_form_performance(form_uuid UUID, student_uuid UUID)
RETURNS TABLE (
    topic_name TEXT,
    questions_answered BIGINT,
    correct_answers BIGINT,
    accuracy_percentage DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.name AS topic_name,
        COUNT(r.id) AS questions_answered,
        SUM(CASE WHEN r.is_correct THEN 1 ELSE 0 END) AS correct_answers,
        CASE 
            WHEN COUNT(r.id) > 0 THEN 
                ROUND((SUM(CASE WHEN r.is_correct THEN 1 ELSE 0 END)::DECIMAL / COUNT(r.id)::DECIMAL) * 100, 2)
            ELSE 0 
        END AS accuracy_percentage
    FROM responses r
    INNER JOIN questions q ON q.id = r.question_id
    INNER JOIN topics t ON t.id = q.topic_id
    WHERE r.form_id = form_uuid AND r.student_id = student_uuid
    GROUP BY t.id, t.name
    ORDER BY accuracy_percentage ASC;
END;
$$ LANGUAGE plpgsql;
