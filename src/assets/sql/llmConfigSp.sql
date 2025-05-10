-- INSERT
CREATE PROCEDURE sp_llmConfigInsert
    @ModelName NVARCHAR(150),
    @ApiKey NVARCHAR(255),
    @IsActive BIT = 1,
    @Notes NVARCHAR(255) = NULL,
    @NewLLMId INT OUTPUT,
    @Success BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

BEGIN TRY
INSERT INTO LLM_Config (ModelName, ApiKey, IsActive, Notes)
        VALUES (@ModelName, @ApiKey, @IsActive, @Notes);

        SET @NewLLMId = SCOPE_IDENTITY();
        SET @Success = 1;
END TRY
BEGIN CATCH
SET @NewLLMId = NULL;
        SET @Success = 0;
END CATCH
END;
GO

-- UPDATE
CREATE PROCEDURE sp_llmConfigUpdate
    @LLMId INT,
    @ModelName NVARCHAR(150),
    @ApiKey NVARCHAR(255),
    @IsActive BIT,
    @Notes NVARCHAR(255),
    @Success BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

BEGIN TRY
UPDATE LLM_Config
SET ModelName = @ModelName,
    ApiKey = @ApiKey,
    IsActive = @IsActive,
    Notes = @Notes
WHERE LLMId = @LLMId AND State = 1;

SET @Success = IIF(@@ROWCOUNT > 0, 1, 0);
END TRY
BEGIN CATCH
SET @Success = 0;
END CATCH
END;
GO

-- SELECT ALL
CREATE PROCEDURE sp_llmConfigSelectAll
    AS
BEGIN
    SET NOCOUNT ON;

SELECT LLMId, ModelName, ApiKey, IsActive, LastUsed, Notes, State
FROM LLM_Config
WHERE State = 1;
END;
GO

-- SELECT BY ID
CREATE PROCEDURE sp_llmConfigSelectById
    @LLMId INT
AS
BEGIN
    SET NOCOUNT ON;

SELECT LLMId, ModelName, ApiKey, IsActive, LastUsed, Notes, State
FROM LLM_Config
WHERE LLMId = @LLMId AND State = 1;
END;
GO

-- LOGICAL DELETE
CREATE PROCEDURE sp_llmConfigLogicDelete
    @LLMId INT,
    @Success BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

BEGIN TRY
UPDATE LLM_Config
SET State = 0
WHERE LLMId = @LLMId AND State = 1;

SET @Success = IIF(@@ROWCOUNT > 0, 1, 0);
END TRY
BEGIN CATCH
SET @Success = 0;
END CATCH
END;
GO

-- UPDATE LAST USED
CREATE PROCEDURE sp_llmConfigUpdateLastUsed
    @LLMId INT,
    @Success BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

BEGIN TRY
UPDATE LLM_Config
SET LastUsed = GETDATE()
WHERE LLMId = @LLMId AND State = 1;

SET @Success = IIF(@@ROWCOUNT > 0, 1, 0);
END TRY
BEGIN CATCH
SET @Success = 0;
END CATCH
END;
GO