-- INSERT
CREATE PROCEDURE sp_categoryInsert
    @Name NVARCHAR(100),
    @Description NVARCHAR(255),
    @NewCategoryId INT OUTPUT,
    @Success BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

BEGIN TRY
INSERT INTO Categories (Name, Description)
        VALUES (@Name, @Description);

        SET @NewCategoryId = SCOPE_IDENTITY();
        SET @Success = 1;
END TRY
BEGIN CATCH
SET @NewCategoryId = NULL;
        SET @Success = 0;
END CATCH
END;
GO

-- UPDATE
CREATE PROCEDURE sp_categoryUpdate
    @CategoryId INT,
    @Name NVARCHAR(100),
    @Description NVARCHAR(255),
    @Success BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

BEGIN TRY
UPDATE Categories
SET Name = @Name,
    Description = @Description
WHERE CategoryId = @CategoryId AND State = 1;

SET @Success = IIF(@@ROWCOUNT > 0, 1, 0);
END TRY
BEGIN CATCH
SET @Success = 0;
END CATCH
END;
GO

-- SELECT ALL
CREATE PROCEDURE sp_categorySelectAll
    AS
BEGIN
    SET NOCOUNT ON;

SELECT CategoryId, Name, Description, State
FROM Categories
WHERE State = 1;
END;
GO

-- SELECT BY ID
CREATE PROCEDURE sp_categorySelectById
    @CategoryId INT
AS
BEGIN
    SET NOCOUNT ON;

SELECT CategoryId, Name, Description, State
FROM Categories
WHERE CategoryId = @CategoryId AND State = 1;
END;
GO

-- LOGICAL DELETE
CREATE PROCEDURE sp_categoryLogicDelete
    @CategoryId INT,
    @Success BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

BEGIN TRY
UPDATE Categories
SET State = 0
WHERE CategoryId = @CategoryId AND State = 1;

SET @Success = IIF(@@ROWCOUNT > 0, 1, 0);
END TRY
BEGIN CATCH
SET @Success = 0;
END CATCH
END;
GO