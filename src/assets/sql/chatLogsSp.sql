-- INSERT
CREATE PROCEDURE sp_chatLogInsert
    @TicketId INT,
    @Question NVARCHAR(MAX),
    @Answer NVARCHAR(MAX),
    @NewLogId INT OUTPUT,
    @Success BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

BEGIN TRY
INSERT INTO ChatLogs (TicketId, Question, Answer)
        VALUES (@TicketId, @Question, @Answer);

        SET @NewLogId = SCOPE_IDENTITY();
        SET @Success = 1;
END TRY
BEGIN CATCH
SET @NewLogId = NULL;
        SET @Success = 0;
END CATCH
END;
GO

-- UPDATE
CREATE PROCEDURE sp_chatLogUpdate
    @LogId INT,
    @Question NVARCHAR(MAX),
    @Answer NVARCHAR(MAX),
    @Success BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

BEGIN TRY
UPDATE ChatLogs
SET Question = @Question,
    Answer = @Answer
WHERE LogId = @LogId AND State = 1;

SET @Success = IIF(@@ROWCOUNT > 0, 1, 0);
END TRY
BEGIN CATCH
SET @Success = 0;
END CATCH
END;
GO

-- SELECT ALL
CREATE PROCEDURE sp_chatLogSelectByTicketId
    AS
BEGIN
    SET NOCOUNT ON;

SELECT LogId, TicketId, Question, Answer, CreatedAt
FROM ChatLogs
WHERE State = 1
ORDER BY CreatedAt ASC;
END;
GO

-- SELECT BY ID
CREATE PROCEDURE sp_chatLogSelectById
    @LogId INT
AS
BEGIN
    SET NOCOUNT ON;

SELECT LogId, TicketId, Question, Answer, CreatedAt
FROM ChatLogs
WHERE LogId = @LogId AND State = 1;
END;
GO

-- LOGICAL DELETE
CREATE PROCEDURE sp_chatLogLogicDelete
    @LogId INT,
    @Success BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

BEGIN TRY
UPDATE ChatLogs
SET State = 0
WHERE LogId = @LogId AND State = 1;

SET @Success = IIF(@@ROWCOUNT > 0, 1, 0);
END TRY
BEGIN CATCH
SET @Success = 0;
END CATCH
END;
GO
