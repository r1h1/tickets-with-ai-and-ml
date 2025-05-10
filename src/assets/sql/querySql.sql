-- Tabla de roles
CREATE TABLE Roles
(
    RoleId        INT PRIMARY KEY IDENTITY(1,1),
    RoleName      NVARCHAR(50) NOT NULL UNIQUE,
    AssignedMenus NVARCHAR(MAX),
    State         BIT DEFAULT 1
);

-- Tabla de usuarios
CREATE TABLE Users
(
    UserId    INT PRIMARY KEY IDENTITY(1,1),
    Name      NVARCHAR(100) NOT NULL,
    Email     NVARCHAR(150) NOT NULL UNIQUE,
    RoleId    INT NOT NULL,
    SeniorityLevel NVARCHAR(150) NOT NULL,
    IsActive  BIT      DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (RoleId) REFERENCES Roles (RoleId),
    State     BIT      DEFAULT 1
);

-- Autenticación
CREATE TABLE Auth
(
    AuthId       INT PRIMARY KEY IDENTITY(1,1),
    UserId       INT NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Salt         NVARCHAR(100),
    LastLogin    DATETIME,
    FOREIGN KEY (UserId) REFERENCES Users (UserId),
    State        BIT DEFAULT 1
);

-- Tabla de categorías (reutilizable por otros módulos)
CREATE TABLE Categories
(
    CategoryId  INT PRIMARY KEY IDENTITY(1,1),
    Name        NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255),
    State       BIT DEFAULT 1
);

-- Tabla fusionada de tickets con historial incluido
CREATE TABLE Tickets
(
    TicketId       INT PRIMARY KEY IDENTITY(1,1),
    Title          NVARCHAR(200) NOT NULL,
    Description    NVARCHAR(MAX),
    Problem        NVARCHAR(MAX),
    Priority       NVARCHAR(20), -- CRITICAL, HIGH, MEDIUM, LOW
    Status         NVARCHAR(20) DEFAULT 'New',
    CreatedAt      DATETIME DEFAULT GETDATE(),
    CreatedBy      INT NOT NULL,
    AssignedTo     INT NULL,
    ClassifiedByML BIT      DEFAULT 1,
    CategoryId     INT NULL,     -- Relación directa
    SuggestedAgent NVARCHAR(100),
    Reasoning      NVARCHAR(255),
    Solution       NVARCHAR(MAX),
    Keywords       NVARCHAR(1000),
    ChangedBy      INT NULL,
    ChangeDate     DATETIME NULL,
    FOREIGN KEY (CreatedBy) REFERENCES Users (UserId),
    FOREIGN KEY (AssignedTo) REFERENCES Users (UserId),
    FOREIGN KEY (CategoryId) REFERENCES Categories (CategoryId),
    FOREIGN KEY (ChangedBy) REFERENCES Users (UserId),
    State          BIT      DEFAULT 1
);

-- Logs del chat
CREATE TABLE ChatLogs
(
    LogId     INT PRIMARY KEY IDENTITY(1,1),
    TicketId  INT NOT NULL,
    Question  NVARCHAR(MAX),
    Answer    NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (TicketId) REFERENCES Tickets (TicketId),
    State     BIT      DEFAULT 1
);

-- Configuración del modelo LLM
CREATE TABLE LLM_Config
(
    LLMId     INT PRIMARY KEY IDENTITY(1,1),
    ModelName NVARCHAR(150) NOT NULL,
    ApiKey    NVARCHAR(255) NOT NULL,
    IsActive  BIT DEFAULT 1,
    LastUsed  DATETIME NULL,
    Notes     NVARCHAR(255),
    State     BIT DEFAULT 1
);