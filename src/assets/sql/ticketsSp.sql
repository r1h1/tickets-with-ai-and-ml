-- INSERT
CREATE PROCEDURE sp_ticketInsert
    @Title NVARCHAR(200),
    @Description NVARCHAR(MAX),
    @Problem NVARCHAR(MAX),
    @Priority NVARCHAR(20),
    @CreatedBy INT,
    @AssignedTo INT = NULL,
    @CategoryId INT = NULL,
    @SuggestedAgent NVARCHAR(100) = NULL,
    @Reasoning NVARCHAR(255) = NULL,
    @Solution NVARCHAR(MAX) = NULL,
    @Keywords NVARCHAR(1000) = NULL,
    @ClassifiedByML BIT = 1,
    @NewTicketId INT OUTPUT,
    @Success BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

BEGIN TRY
INSERT INTO Tickets (
            Title, Description, Problem, Priority, CreatedBy,
            AssignedTo, CategoryId, SuggestedAgent, Reasoning,
            Solution, Keywords, ClassifiedByML
        )
        VALUES (
            @Title, @Description, @Problem, @Priority, @CreatedBy,
            @AssignedTo, @CategoryId, @SuggestedAgent, @Reasoning,
            @Solution, @Keywords, @ClassifiedByML
        );

        SET @NewTicketId = SCOPE_IDENTITY();
        SET @Success = 1;
END TRY
BEGIN CATCH
SET @NewTicketId = NULL;
        SET @Success = 0;
END CATCH
END;
GO

-- UPDATE AND INCLUDE HISTORY
CREATE PROCEDURE sp_ticketUpdate
    @TicketId INT,
    @Title NVARCHAR(200),
    @Description NVARCHAR(MAX),
    @Problem NVARCHAR(MAX),
    @Priority NVARCHAR(20),
    @Status NVARCHAR(20),
    @AssignedTo INT = NULL,
    @CategoryId INT = NULL,
    @SuggestedAgent NVARCHAR(100) = NULL,
    @Reasoning NVARCHAR(255) = NULL,
    @Solution NVARCHAR(MAX) = NULL,
    @Keywords NVARCHAR(1000) = NULL,
    @ClassifiedByML BIT = 1,
    @ChangedBy INT,
    @Success BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

BEGIN TRY
UPDATE Tickets
SET Title = @Title,
    Description = @Description,
    Problem = @Problem,
    Priority = @Priority,
    Status = @Status,
    AssignedTo = @AssignedTo,
    CategoryId = @CategoryId,
    SuggestedAgent = @SuggestedAgent,
    Reasoning = @Reasoning,
    Solution = @Solution,
    Keywords = @Keywords,
    ClassifiedByML = @ClassifiedByML,
    ChangedBy = @ChangedBy,
    ChangeDate = GETDATE()
WHERE TicketId = @TicketId AND State = 1;

SET @Success = IIF(@@ROWCOUNT > 0, 1, 0);
END TRY
BEGIN CATCH
SET @Success = 0;
END CATCH
END;
GO

-- SELECT ALL (WITH RELATIONS TO OTHER TABLES)
CREATE PROCEDURE sp_ticketSelectAll
    AS
BEGIN
    SET NOCOUNT ON;

SELECT
    T.TicketId,
    T.Title,
    T.Description,
    T.Problem,
    T.Priority,
    T.Status,
    T.CreatedAt,
    T.CreatedBy,
    CU.Name AS CreatedByName,
    T.AssignedTo,
    AU.Name AS AssignedToName,
    T.CategoryId,
    C.Name AS CategoryName,
    T.SuggestedAgent,
    T.Reasoning,
    T.Solution,
    T.Keywords,
    T.ClassifiedByML,
    T.ChangedBy,
    CHU.Name AS ChangedByName,
    T.ChangeDate,
    T.State
FROM Tickets T
         LEFT JOIN Users CU ON T.CreatedBy = CU.UserId
         LEFT JOIN Users AU ON T.AssignedTo = AU.UserId
         LEFT JOIN Users CHU ON T.ChangedBy = CHU.UserId
         LEFT JOIN Categories C ON T.CategoryId = C.CategoryId
WHERE T.State = 1;
END;
GO

-- SELECT BY ID (WITH RELATIONS TO OTHER TABLES)
CREATE PROCEDURE sp_ticketSelectById
    @TicketId INT
AS
BEGIN
    SET NOCOUNT ON;

SELECT
    T.TicketId,
    T.Title,
    T.Description,
    T.Problem,
    T.Priority,
    T.Status,
    T.CreatedAt,
    T.CreatedBy,
    CU.Name AS CreatedByName,
    T.AssignedTo,
    AU.Name AS AssignedToName,
    T.CategoryId,
    C.Name AS CategoryName,
    T.SuggestedAgent,
    T.Reasoning,
    T.Solution,
    T.Keywords,
    T.ClassifiedByML,
    T.ChangedBy,
    CHU.Name AS ChangedByName,
    T.ChangeDate,
    T.State
FROM Tickets T
         LEFT JOIN Users CU ON T.CreatedBy = CU.UserId
         LEFT JOIN Users AU ON T.AssignedTo = AU.UserId
         LEFT JOIN Users CHU ON T.ChangedBy = CHU.UserId
         LEFT JOIN Categories C ON T.CategoryId = C.CategoryId
WHERE T.TicketId = @TicketId AND T.State = 1;
END;
GO

-- LOGICAL DELETE
CREATE PROCEDURE sp_ticketLogicDelete
    @TicketId INT,
    @Success BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

BEGIN TRY
UPDATE Tickets
SET State = 0
WHERE TicketId = @TicketId AND State = 1;

SET @Success = IIF(@@ROWCOUNT > 0, 1, 0);
END TRY
BEGIN CATCH
SET @Success = 0;
END CATCH
END;
GO
